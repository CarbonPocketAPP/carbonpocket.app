import Stripe from 'stripe';
import { linkAttestationToContributor, recordContributorPayment } from '../lib/contributor-ledger.js';
import { createUnpooledDatabase } from './db-unpooled.js';

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

function invoiceKg(invoice, subscriptionId, fallback) {
  const line = invoiceLine(invoice, subscriptionId);
  const quantity = line?.quantity ?? invoice.lines?.data?.find(
    (item) => item.quantity !== null && item.quantity !== undefined,
  )?.quantity;
  return contributionKg(quantity ?? fallback);
}

function invoiceLine(invoice, subscriptionId) {
  const lines = invoice.lines?.data || [];
  return lines.find((line) =>
    line.subscription === subscriptionId ||
    line.parent?.subscription_item_details?.subscription === subscriptionId,
  ) || lines.find((item) => item.quantity !== null && item.quantity !== undefined);
}

async function forEachPage(listPage, visit) {
  let startingAfter;
  let hasMore = true;
  while (hasMore) {
    const page = await listPage(startingAfter);
    for (const item of page.data) await visit(item);
    hasMore = page.has_more;
    startingAfter = hasMore && page.data.length > 0
      ? page.data[page.data.length - 1].id
      : undefined;
    if (!startingAfter) hasMore = false;
  }
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required.');
}
if (
  typeof process.env.CONTRIBUTOR_IDENTITY_SECRET !== 'string' ||
  Buffer.byteLength(process.env.CONTRIBUTOR_IDENTITY_SECRET) < 32
) {
  throw new Error('CONTRIBUTOR_IDENTITY_SECRET must contain at least 32 bytes.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { db, pool } = createUnpooledDatabase();
const counts = { checkout: 0, invoice: 0, linkedAttestations: 0 };

try {
  await forEachPage(
    (startingAfter) => stripe.checkout.sessions.list({
      status: 'complete',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    }),
    async (session) => {
      if (!['paid', 'no_payment_required'].includes(session.payment_status)) return;
      if (session.metadata?.origem && session.metadata.origem !== 'site') return;

      const email = session.customer_details?.email || session.customer_email || '';
      const name = session.metadata?.nome || session.customer_details?.name || '';
      const common = {
        email,
        name,
        consent: isPublicConsent(session.metadata),
      };

      if (session.mode === 'payment') {
        const kg = contributionKg(session.metadata?.emissao_kg);
        if (!kg) return;
        const result = await recordContributorPayment(db, {
          stripeReference: session.id,
          kg,
          country: countryFrom(session.metadata),
          planType: session.metadata?.categoria || null,
          paymentType: 'checkout',
          occurredAt: new Date(session.created * 1000),
          ...common,
          attestationPaymentReference: session.id,
        });
        if (result.created) counts.checkout += 1;
        return;
      }

      const contributorId = await linkAttestationToContributor(db, {
        paymentReference: session.id,
        ...common,
      });
      if (contributorId) counts.linkedAttestations += 1;
    },
  );

  await forEachPage(
    (startingAfter) => stripe.subscriptions.list({
      status: 'all',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    }),
    async (subscription) => {
      const metadata = subscription.metadata || {};
      if (metadata.origem && metadata.origem !== 'site') return;
      const customer = typeof subscription.customer === 'string'
        ? await stripe.customers.retrieve(subscription.customer)
        : subscription.customer;
      const customerEmail = customer && !customer.deleted ? customer.email : '';
      const customerName = customer && !customer.deleted ? customer.name : '';
      const email = customerEmail || '';
      const name = metadata.nome || customerName || '';

      await forEachPage(
        (startingAfter) => stripe.invoices.list({
          subscription: subscription.id,
          status: 'paid',
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        }),
        async (invoice) => {
          const kg = invoiceKg(invoice, subscription.id, metadata.emissao_kg);
          if (!kg) return;
          const line = invoiceLine(invoice, subscription.id);
          const coverageStart = metadata.categoria === 'anual' && line?.period?.start
            ? new Date(line.period.start * 1000)
            : undefined;
          const coverageEnd = metadata.categoria === 'anual' && line?.period?.end
            ? new Date(line.period.end * 1000)
            : undefined;
          const result = await recordContributorPayment(db, {
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
            email: invoice.customer_email || email,
            name: invoice.customer_name || name,
            consent: isPublicConsent(metadata),
          });
          if (result.created) counts.invoice += 1;
        },
      );
    },
  );

  console.log('CONTRIBUTOR_LEDGER_BACKFILL_COMPLETE', JSON.stringify(counts));
} catch (error) {
  console.error('CONTRIBUTOR_LEDGER_BACKFILL_FAILED', error.name);
  process.exitCode = 1;
} finally {
  await pool.end();
}
