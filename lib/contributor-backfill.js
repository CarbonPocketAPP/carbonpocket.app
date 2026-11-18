import {
  linkAttestationToContributor,
  recordContributorPayment,
} from './contributor-ledger.js';

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
