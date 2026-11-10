import Stripe from 'stripe';
import { sanitizeName } from './name.js';

function formatarBRL(centavos) {
  if (centavos === null || centavos === undefined) return null;
  return 'R$ ' + (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function handler(req, res) {
  const base = String(process.env.SITE_URL || '').replace(/\/$/, '');

  res.setHeader('Access-Control-Allow-Origin', base);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Method not allowed' });
  }

  const sessionId = typeof req.query?.session_id === 'string'
    ? req.query.session_id
    : '';
  if (!sessionId.startsWith('cs_') || sessionId.length < 10 || sessionId.length > 255) {
    return res.status(400).json({ erro: 'Invalid session' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    return res.status(200).json({
      status: session.status,
      payment_status: session.payment_status,
      mode: session.mode,
      amount_total: session.amount_total,
      amount_total_display: formatarBRL(session.amount_total),
      currency: session.currency,
      quantity: session.line_items?.data?.[0]?.quantity ?? null,
      customer_email: session.customer_details?.email ?? session.customer_email ?? null,
      categoria: session.metadata?.categoria ?? null,
      emissao_kg: session.metadata?.emissao_kg ?? null,
      nome: sanitizeName(session.metadata?.nome),
    });
  } catch {
    console.error('ERRO_STRIPE_SESSAO');
    return res.status(500).json({ erro: 'Unable to retrieve payment' });
  }
}
