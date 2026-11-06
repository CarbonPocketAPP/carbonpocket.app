import Stripe from 'stripe';

const priceIds = {
  unico: process.env.STRIPE_PRICE_UNICO,
  mensal: process.env.STRIPE_PRICE_MENSAL,
  anual: process.env.STRIPE_PRICE_ANUAL,
};

export default async function handler(req, res) {
  const base = (process.env.SITE_URL || '').replace(/\/$/, '');

  res.setHeader('Access-Control-Allow-Origin', base);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Metodo nao permitido' });
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
        erro: 'Não foi possível iniciar o pagamento',
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
      custom_fields: [
        {
          key: 'contribuinte',
          label: {
            type: 'custom',
            custom: 'Nome do contribuinte',
          },
          type: 'text',
        },
      ],
      metadata,
      ...(categoria !== 'unico' ? { subscription_data: { metadata } } : {}),
      success_url: `${base}/carbonpocket-calculator/sucesso.html`,
      cancel_url: `${base}/carbonpocket-calculator/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Falha ao criar a sessao Stripe:', error);
    return res.status(500).json({
      erro: 'Não foi possível iniciar o pagamento',
    });
  }
}
