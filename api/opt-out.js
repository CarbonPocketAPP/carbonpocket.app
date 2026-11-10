import Stripe from 'stripe';
import { sanitizeName } from './name.js';

const responseMessage = 'Your request has been received.';

export default async function handler(req, res) {
  const base = String(process.env.SITE_URL || '').replace(/\/$/, '');

  res.setHeader('Access-Control-Allow-Origin', base);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(200).json({ message: responseMessage });
    }
  }

  const validBody = body && typeof body === 'object' && !Array.isArray(body);
  const rawName = validBody ? String(body.nome ?? '') : '';
  const name = sanitizeName(rawName);
  const email = validBody
    ? String(body.email || '').trim().toLowerCase()
    : '';

  if (!rawName.trim() || !email || !process.env.STRIPE_SECRET_KEY) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('SEGREDO_STRIPE_AUSENTE_PARA_EXCLUSAO');
    }
    return res.status(200).json({ message: responseMessage });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let startingAfter;
    let hasMore = true;
    const expectedName = name.toLowerCase();

    while (hasMore) {
      const page = await stripe.checkout.sessions.list({
        status: 'complete',
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      for (const session of page.data) {
        if (!['paid', 'no_payment_required'].includes(session.payment_status)) continue;

        const sessionEmail = String(
          session.customer_details?.email ?? session.customer_email ?? '',
        ).trim().toLowerCase();
        const sessionName = sanitizeName(session.metadata?.nome).toLowerCase();
        if (sessionEmail !== email || sessionName !== expectedName) continue;

        // A solicitação desativa a exibição pública em todas as sessões pagas correspondentes.
        await stripe.checkout.sessions.update(session.id, {
          metadata: { ...session.metadata, opt_out: 'true' },
        });
      }

      hasMore = page.has_more;
      if (hasMore && page.data.length > 0) {
        startingAfter = page.data[page.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }
  } catch (error) {
    console.error('ERRO_STRIPE_EXCLUSAO_NOME', error.type, error.code);
  }

  return res.status(200).json({ message: responseMessage });
}
