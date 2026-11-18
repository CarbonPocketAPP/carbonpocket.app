import {
  linkExistingContributorPayment,
  linkAttestationToContributor,
  recordContributorPayment,
} from './contributor-ledger.js';
import { sanitizeName } from '../api/name.js';

const PAGE_SIZE = 10;

export function initialContributorBackfillCursor() {
  return {
    phase: 'checkouts',
    checkoutAfter: null,
    subscriptionAfter: null,
    subscriptionId: null,
    invoiceAfter: null,
  };
}

function isPublicConsent(metadata = {}) {
  return metadata.opt_out === 'false' && metadata.exibir_nome === 'true';
}

function countryFrom(metadata = {}) {
  const country = String(metadata.pais || '').toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : 'nao_informado';
}

function contributionKg(value) {
  const kg = Number(value);
  if (!Number.isFinite(kg) || kg <= 0) return null;
  return Math.min(100000, Math.max(25, Math.round(kg)));
}

function invoiceLine(invoice, subscriptionId) {
  const lines = invoice.lines?.data || [];
  return lines.find((line) =>
    line.subscription === subscriptionId ||
    line.parent?.subscription_item_details?.subscription === subscriptionId,
  ) || lines.find((item) => item.quantity !== null && item.quantity !== undefined);
}

function invoiceKg(invoice, subscriptionId, fallback) {
  const line = invoiceLine(invoice, subscriptionId);
  const quantity = line?.quantity ?? invoice.lines?.data?.find(
    (item) => item.quantity !== null && item.quantity !== undefined,
  )?.quantity;
  return contributionKg(quantity ?? fallback);
}

function advanceCursor(cursor, subscriptionId) {
  return {
    phase: 'subscriptions',
    checkoutAfter: null,
    subscriptionAfter: subscriptionId,
    subscriptionId: null,
    invoiceAfter: null,
  };
}

async function processCheckoutPage(stripe, database, cursor) {
  const page = await stripe.checkout.sessions.list({
    status: 'complete',
    limit: PAGE_SIZE,
    ...(cursor.checkoutAfter ? { starting_after: cursor.checkoutAfter } : {}),
  });
  const processed = { checkout: 0, invoice: 0, linkedAttestations: 0 };

  for (const session of page.data) {
    if (!['paid', 'no_payment_required'].includes(session.payment_status)) continue;
    if (session.metadata?.origem && session.metadata.origem !== 'site') continue;

    const email = session.customer_details?.email || session.customer_email || '';
    const name = session.metadata?.nome || session.customer_details?.name || '';
    const consent = isPublicConsent(session.metadata);

    if (session.mode === 'payment') {
      const kg = contributionKg(session.metadata?.emissao_kg);
      if (!kg) continue;
      const result = await recordContributorPayment(database, {
        stripeReference: session.id,
        kg,
        country: countryFrom(session.metadata),
        planType: session.metadata?.categoria || null,
        paymentType: 'checkout',
        occurredAt: new Date(session.created * 1000),
        email,
        name,
        consent,
        attestationPaymentReference: session.id,
      });
      if (result.created) processed.checkout += 1;
      continue;
    }

    const contributorId = await linkAttestationToContributor(database, {
      paymentReference: session.id,
      email,
      name,
      consent,
    });
    if (contributorId) processed.linkedAttestations += 1;
  }

  if (page.has_more && page.data.length > 0) {
    return {
      cursor: { ...cursor, checkoutAfter: page.data[page.data.length - 1].id },
      processed,
      done: false,
    };
  }

  return {
    cursor: initialContributorBackfillCursor(),
    processed,
    done: false,
    transitionToSubscriptions: true,
  };
}

async function processSubscriptionPage(stripe, database, cursor) {
  let subscription;
  if (cursor.subscriptionId) {
    subscription = await stripe.subscriptions.retrieve(cursor.subscriptionId, {
      expand: ['customer'],
    });
  } else {
    const page = await stripe.subscriptions.list({
      status: 'all',
      limit: 1,
      ...(cursor.subscriptionAfter
        ? { starting_after: cursor.subscriptionAfter }
        : {}),
    });
    subscription = page.data[0];
    if (!subscription) {
      return { cursor, processed: emptyCounts(), done: true };
    }
    subscription = await stripe.subscriptions.retrieve(subscription.id, {
      expand: ['customer'],
    });
  }

  const processed = emptyCounts();
  const metadata = subscription.metadata || {};
  if (metadata.origem && metadata.origem !== 'site') {
    return {
      cursor: advanceCursor(cursor, subscription.id),
      processed,
      done: false,
    };
  }

  const invoicePage = await stripe.invoices.list({
    subscription: subscription.id,
    status: 'paid',
    limit: PAGE_SIZE,
    ...(cursor.invoiceAfter ? { starting_after: cursor.invoiceAfter } : {}),
  });
  const customer = typeof subscription.customer === 'string'
    ? await stripe.customers.retrieve(subscription.customer)
    : subscription.customer;
  const customerEmail = customer && !customer.deleted ? customer.email : '';
  const customerName = customer && !customer.deleted ? customer.name : '';

  for (const invoice of invoicePage.data) {
    const kg = invoiceKg(invoice, subscription.id, metadata.emissao_kg);
    if (!kg) continue;

    const line = invoiceLine(invoice, subscription.id);
    const coverageStart = metadata.categoria === 'anual' && line?.period?.start
      ? new Date(line.period.start * 1000)
      : undefined;
    const coverageEnd = metadata.categoria === 'anual' && line?.period?.end
      ? new Date(line.period.end * 1000)
      : undefined;
    const result = await recordContributorPayment(database, {
      stripeReference: invoice.id,
      kg,
      country: countryFrom(metadata),
      planType: metadata.categoria === 'mensal' || metadata.categoria === 'anual'
        ? metadata.categoria
        : null,
      paymentType: 'invoice',
      occurredAt: new Date(
        (invoice.status_transitions?.paid_at || invoice.created) * 1000,
      ),
      coverageStart,
      coverageEnd,
      email: invoice.customer_email || customerEmail,
      name: invoice.customer_name || metadata.nome || customerName,
      consent: isPublicConsent(metadata),
    });
    if (result.created) processed.invoice += 1;
  }

  if (invoicePage.has_more && invoicePage.data.length > 0) {
    return {
      cursor: {
        ...cursor,
        subscriptionId: subscription.id,
        invoiceAfter: invoicePage.data[invoicePage.data.length - 1].id,
      },
      processed,
      done: false,
    };
  }

  return {
    cursor: advanceCursor(cursor, subscription.id),
    processed,
    done: false,
  };
}

function emptyCounts() {
  return { checkout: 0, invoice: 0, linkedAttestations: 0 };
}

export async function processContributorBackfillBatch(stripe, database, cursor) {
  if (cursor.phase === 'checkouts') {
    const result = await processCheckoutPage(stripe, database, cursor);
    if (result.transitionToSubscriptions) {
      return {
        cursor: { ...initialContributorBackfillCursor(), phase: 'subscriptions' },
        processed: result.processed,
        done: false,
      };
    }
    return result;
  }

  return processSubscriptionPage(stripe, database, cursor);
}

export async function linkHistoricalOneTimeCheckout(
  stripe,
  database,
  { sessionId, displayName },
) {
  if (
    typeof sessionId !== 'string' ||
    !/^cs_(?:live|test)_[A-Za-z0-9]+$/.test(sessionId)
  ) {
    throw new TypeError('Invalid Stripe Checkout Session ID.');
  }
  const name = sanitizeName(displayName);
  if (name === 'Anonymous' || name.includes('@')) {
    throw new TypeError('A public display name is required.');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (
    session.mode !== 'payment' ||
    !['paid', 'no_payment_required'].includes(session.payment_status) ||
    (session.metadata?.origem && session.metadata.origem !== 'site')
  ) {
    throw new Error('Checkout is not an eligible paid one-time site purchase.');
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 2,
  });
  if (lineItems.has_more || lineItems.data.length !== 1) {
    throw new Error('Checkout must contain exactly one line item.');
  }

  const lineItem = lineItems.data[0];
  const kg = contributionKg(session.metadata?.emissao_kg ?? lineItem.quantity);
  if (!kg) throw new Error('Checkout does not contain a valid compensation quantity.');

  const email = session.customer_details?.email || session.customer_email || '';
  const countryCode = String(
    session.metadata?.pais || session.customer_details?.address?.country || '',
  ).toUpperCase();
  const country = /^[A-Z]{2}$/.test(countryCode) ? countryCode : 'nao_informado';
  const category = ['unico', 'avulso'].includes(session.metadata?.categoria)
    ? session.metadata.categoria
    : null;
  const payment = await recordContributorPayment(database, {
    stripeReference: session.id,
    kg,
    country,
    planType: category,
    paymentType: 'checkout',
    occurredAt: new Date(session.created * 1000),
    email,
    name,
    consent: true,
    attestationPaymentReference: session.id,
  });
  const linked = await linkExistingContributorPayment(database, {
    stripeReference: session.id,
    email,
    name,
    consent: true,
  });

  if (!linked.linked) {
    return { linked: false, created: payment.created, reason: linked.reason };
  }
  return { linked: true, created: payment.created, kg };
}
