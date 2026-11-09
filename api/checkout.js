import Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

const priceIds = {
  unico: process.env.STRIPE_PRICE_UNICO,
  mensal: process.env.STRIPE_PRICE_MENSAL,
  anual: process.env.STRIPE_PRICE_ANUAL,
};

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

  let body;
  try {
    body = req.body || {};
    if (Buffer.isBuffer(body)) body = body.toString('utf8');
    if (typeof body === 'string') body = JSON.parse(body);
    if (!body || typeof body !== 'object') throw new Error('corpo invalido');
  } catch {
    console.error('BODY_INVALIDO', typeof req.body);
    return res.status(400).json({ erro: 'Invalid request' });
  }

  try {
    const requiredVariables = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_PRICE_UNICO: process.env.STRIPE_PRICE_UNICO,
      STRIPE_PRICE_MENSAL: process.env.STRIPE_PRICE_MENSAL,
      STRIPE_PRICE_ANUAL: process.env.STRIPE_PRICE_ANUAL,
      SITE_URL: process.env.SITE_URL,
    };
    const missingVariables = Object.entries(requiredVariables)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingVariables.length > 0) {
      console.error(`Variaveis obrigatorias ausentes: ${missingVariables.join(', ')}`);
      return res.status(500).json({
        erro: 'Unable to start payment',
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = req.body || {};
    const categoriasValidas = ['unico', 'mensal', 'anual'];
    const categoria = categoriasValidas.includes(body.categoria)
      ? body.categoria
      : 'mensal';
    const quantidade = Math.min(
      100000,
      Math.max(25, Math.round(Number(body.emissaoKg) || 0)),
    );
    const nome = String(body.nome || '');
    const email = String(body.email || '');
    const mode = categoria === 'unico' ? 'payment' : 'subscription';

    const metadata = {
      nome,
      emissao_kg: String(quantidade),
      categoria,
    };

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: priceIds[categoria],
          quantity: quantidade,
        },
      ],
      ...(email ? { customer_email: email } : {}),
      metadata,
      ...(categoria !== 'unico' ? { subscription_data: { metadata } } : {}),
      success_url: `${base}/carbonpocket-calculator/sucesso.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/carbonpocket-calculator/`,
    });

    const selectedPrice = await stripe.prices.retrieve(priceIds[categoria]);
    const unitAmount = Number(selectedPrice.unit_amount || 0);
    return res.status(200).json({
      url: session.url,
      amount_total: unitAmount * quantidade,
      currency: selectedPrice.currency || 'usd',
      quantity: quantidade,
    });
  } catch (error) {
    console.error('STRIPE_ERROR', error.type, error.code, error.param);
    return res.status(500).json({
      erro: 'Unable to start payment',
    });
  }
}
