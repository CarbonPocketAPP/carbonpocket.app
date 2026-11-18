import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { attestations, contributorProfiles } from '../lib/schema.js';

const responseMessage = 'Your request has been received.';
const CODE_RE = /^CP-\d{4}-[A-HJ-NP-Z2-9]{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  const base = String(process.env.SITE_URL || '').replace(/\/$/, '');
  res.setHeader('Access-Control-Allow-Origin', base);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: responseMessage });
  }

  const origin = req.headers.origin;
  if (origin && origin !== base) {
    return res.status(403).json({ message: responseMessage });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ message: responseMessage });
    }
  }

  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!CODE_RE.test(code) || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(200).json({ message: responseMessage });
  }

  try {
    const [contribution] = await db
      .select({
        paymentReference: attestations.paymentReference,
        contributorId: attestations.contributorId,
      })
      .from(attestations)
      .where(eq(attestations.code, code))
      .limit(1);
    if (!contribution?.paymentReference) {
      return res.status(200).json({ message: responseMessage });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(contribution.paymentReference);
    const sessionEmail = String(
      session.customer_details?.email ?? session.customer_email ?? '',
    ).trim().toLowerCase();
    if (
      !['paid', 'no_payment_required'].includes(session.payment_status) ||
      sessionEmail !== email
    ) {
      return res.status(200).json({ message: responseMessage });
    }

    await stripe.checkout.sessions.update(session.id, {
      metadata: {
        ...session.metadata,
        opt_out: 'true',
        exibir_nome: 'false',
      },
    });

    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await stripe.subscriptions.update(subscriptionId, {
        metadata: {
          ...subscription.metadata,
          opt_out: 'true',
          exibir_nome: 'false',
        },
      });
    }

    if (contribution.contributorId) {
      await db
        .update(contributorProfiles)
        .set({
          consentToPublish: false,
          updatedAt: new Date(),
        })
        .where(eq(contributorProfiles.id, contribution.contributorId));
    }
  } catch (error) {
    console.error('ERRO_STRIPE_EXCLUSAO_NOME', error?.type, error?.code);
    return res.status(503).json({ message: 'Unable to process request. Please try again later.' });
  }

  return res.status(200).json({ message: responseMessage });
}
