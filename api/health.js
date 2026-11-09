import Stripe from 'stripe';

export default async function handler(req, res) {
  const base = String(process.env.SITE_URL || '').replace(/\/$/, '');

  // Permite a leitura publica de estado sem expor segredos do Stripe.
  res.setHeader('Access-Control-Allow-Origin', base);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Method not allowed' });
  }

  const env = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'set' : 'missing',
    STRIPE_PRICE_UNICO: process.env.STRIPE_PRICE_UNICO ? 'set' : 'missing',
    STRIPE_PRICE_MENSAL: process.env.STRIPE_PRICE_MENSAL ? 'set' : 'missing',
    STRIPE_PRICE_ANUAL: process.env.STRIPE_PRICE_ANUAL ? 'set' : 'missing',
    SITE_URL: process.env.SITE_URL ? 'set' : 'missing',
  };

  const priceIds = {
    unico: process.env.STRIPE_PRICE_UNICO,
    mensal: process.env.STRIPE_PRICE_MENSAL,
    anual: process.env.STRIPE_PRICE_ANUAL,
  };
  const expected = {
    unico: { type: 'one_time' },
    mensal: { interval: 'month' },
    anual: { interval: 'year' },
  };
  const prices = {};

  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    for (const [categoria, priceId] of Object.entries(priceIds)) {
      try {
        if (!priceId) {
          prices[categoria] = { unit_amount: null, currency: 'usd', ...expected[categoria], error: 'missing_price_id' };
          continue;
        }

        const price = await stripe.prices.retrieve(priceId);
        prices[categoria] = {
          unit_amount: price.unit_amount ?? null,
          currency: price.currency || 'usd',
          ...(categoria === 'unico'
            ? { type: price.type === 'one_time' ? 'one_time' : String(price.type || '') }
            : { interval: price.recurring?.interval || null }),
        };
      } catch (error) {
        prices[categoria] =
          error.type === 'StripePermissionError'
            ? { unit_amount: null, currency: 'usd', ...expected[categoria], error: 'permission_denied' }
            : { unit_amount: null, currency: 'usd', ...expected[categoria], error: 'stripe_error' };
      }
    }
  } else {
    for (const [categoria, value] of Object.entries(expected)) {
      prices[categoria] = { unit_amount: null, currency: 'usd', ...value, error: 'missing_secret_key' };
    }
  }

  const config = {
    site_url: String(process.env.SITE_URL || ''),
    success_url_template: `${base}/carbonpocket-calculator/sucesso.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/carbonpocket-calculator/`,
  };

  return res.status(200).json({ env, prices, config });
}
