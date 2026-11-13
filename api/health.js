import Stripe from 'stripe';
import { Pool } from 'pg';

const healthPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 3000,
});

async function verificarBanco() {
  const inicio = Date.now();
  let timeout;
  try {
    const conectado = await Promise.race([
      healthPool.query({ text: 'SELECT 1', query_timeout: 3000 }).then(() => true),
      new Promise((resolve) => {
        timeout = setTimeout(() => resolve(false), 3000);
      }),
    ]);
    return { conectado, latencia_ms: Date.now() - inicio };
  } catch {
    return { conectado: false, latencia_ms: Date.now() - inicio };
  } finally {
    clearTimeout(timeout);
  }
}

// Converte o valor informado pelo Stripe sem mascarar valores decimais ou nulos.
function valorEfetivoCentavos(price) {
  if (price.unit_amount !== null && price.unit_amount !== undefined) {
    return price.unit_amount;
  }
  if (price.unit_amount_decimal) {
    return Number(price.unit_amount_decimal);
  }
  return null;
}

// Formata centavos cobrados em reais no padrão brasileiro.
function formatarBRL(centavos) {
  if (centavos === null || centavos === undefined) return null;
  return 'R$ ' + (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarUSD(centavos) {
  if (centavos === null || centavos === undefined) return null;
  return 'US$ ' + (centavos / 100).toFixed(2);
}

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
        const effectiveUnitAmount = valorEfetivoCentavos(price);
        let diagnostico = 'OK: per_unit + licensed; cobra quantity no checkout';
        if (price.unit_amount === null && price.unit_amount_decimal) {
          diagnostico = 'OK: usa unit_amount_decimal (fração de centavo); ler o campo decimal';
        }
        if (price.billing_scheme === 'tiered') diagnostico = 'BLOQUEIO: billing_scheme tiered';
        if (price.custom_unit_amount) diagnostico = 'BLOQUEIO: custom_unit_amount definido pelo cliente';
        if (price.recurring?.usage_type === 'metered') diagnostico = 'BLOQUEIO: usage_type metered';
        prices[categoria] = {
          id: price.id,
          unit_amount: price.unit_amount ?? null,
          unit_amount_decimal: price.unit_amount_decimal ?? null,
          currency: price.currency || 'usd',
          type: price.type,
          interval: price.recurring?.interval ?? null,
          billing_scheme: price.billing_scheme,
          usage_type: price.recurring?.usage_type ?? price.usage_type ?? null,
          effective_unit_amount: effectiveUnitAmount,
          active: price.active,
          diagnostico,
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
  const banco = await verificarBanco();

  const effective = Object.fromEntries(
    Object.entries(prices).map(([categoria, price]) => [categoria, price.effective_unit_amount]),
  );
  const unico = effective.unico;
  const anual = effective.anual;
  // brl representa a cobrança real; usd_ref é somente uma referência comercial.
  const simulacao = Object.fromEntries(
    [25, 137, 1000].map((kg) => [
      `${kg}kg`,
      {
        unico_brl: formatarBRL(unico === null ? null : unico * kg),
        anual_brl: formatarBRL(anual === null ? null : anual * kg),
        unico_usd_ref: formatarUSD(Math.round(0.02 * kg * 100)),
        anual_usd_ref: formatarUSD(Math.round(0.204 * kg * 100)),
      },
    ]),
  );

  return res.status(200).json({ env, prices, simulacao, config, banco });
}
