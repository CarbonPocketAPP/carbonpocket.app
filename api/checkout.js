import Stripe from 'stripe';
import { sanitizeName } from './name.js';

const priceIds = {
  unico: process.env.STRIPE_PRICE_UNICO,
  mensal: process.env.STRIPE_PRICE_MENSAL,
  anual: process.env.STRIPE_PRICE_ANUAL,
};

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

// Formata os centavos cobrados em reais no padrão brasileiro.
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Method not allowed' });
  }

  // Contadores em memória não são compartilhados entre instâncias serverless e não limitam o volume de forma confiável.
  const origin = req.headers.origin;
  if (origin && origin !== 'https://carbonpocket.app') {
    return res.status(403).json({ erro: 'Forbidden' });
  }

  const contentType = req.headers['content-type'] || '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return res.status(415).json({ erro: 'Content-Type must be application/json' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      console.error('BODY_INVALIDO_TEXTO', body.slice(0, 100));
      return res.status(400).json({ erro: 'Invalid request' });
    }
  }
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    console.error('BODY_AUSENTE', typeof req.body);
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
    const categoriasValidas = ['unico', 'mensal', 'anual'];
    const categoria = categoriasValidas.includes(body.categoria)
      ? body.categoria
      : 'mensal';
    const quantidade = Math.min(
      100000,
      Math.max(25, Math.round(Number(body.emissaoKg) || 0)),
    );
    const nome = sanitizeName(body.nome);
    const email = String(body.email || '');
    const origensValidas = ['site', 'app'];
    const origem = origensValidas.includes(body.origem) ? body.origem : 'site';
    const paisInformado = String(body.pais ?? '').trim().toUpperCase();
    const pais = /^[A-Z]{2}$/.test(paisInformado) ? paisInformado : 'nao_informado';
    const mode = categoria === 'unico' ? 'payment' : 'subscription';

    const metadata = {
      nome,
      emissao_kg: String(quantidade),
      categoria,
      // Registra a origem da compra; o app deve enviar origem = 'app'.
      origem,
      pais,
    };
    const subscriptionMetadata = {
      ...metadata,
      kg_por_ano: '{}',
      faturas_por_ano: '{}',
      ultima_invoice_id: '',
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
      ...(categoria !== 'unico'
        ? { subscription_data: { metadata: subscriptionMetadata } }
        : {}),
      success_url: `${base}/carbonpocket-calculator/sucesso.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/carbonpocket-calculator/`,
    });
    const sessionCompleta = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items'],
    });

    return res.status(200).json({
      url: session.url,
      amount_total: sessionCompleta.amount_total,
      amount_total_display: formatarBRL(sessionCompleta.amount_total),
      currency: sessionCompleta.currency,
      quantity: sessionCompleta.line_items?.data?.[0]?.quantity ?? null,
      mode: sessionCompleta.mode,
    });
  } catch (error) {
    console.error('ERRO_STRIPE_CHECKOUT', error.type, error.code, error.param);
    return res.status(500).json({
      erro: 'Unable to start payment',
    });
  }
}
