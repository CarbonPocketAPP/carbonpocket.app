import Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

const eventTypes = new Set([
  'checkout.session.completed',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('WEBHOOK_CONFIGURATION_MISSING');
    return res.status(500).json({ erro: 'Unable to verify event' });
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const rawBody = Buffer.concat(chunks);
  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') {
    return res.status(400).json({ erro: 'Invalid signature' });
  }

  let event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    console.error('WEBHOOK_SIGNATURE_INVALID');
    return res.status(400).json({ erro: 'Invalid signature' });
  }

  if (eventTypes.has(event.type)) {
    console.log('STRIPE_EVENT', event.type, event.data.object.id);
  }

  // O fulfillment é manual e agregado; a Brcarbon não tem API. Este webhook serve apenas como registro de eventos.
  return res.status(200).json({ received: true });
}
