import Stripe from 'stripe';
import { sanitizeName } from './name.js';

export default async function handler(req, res) {
  const base = String(process.env.SITE_URL || '').replace(/\/$/, '');

  res.setHeader('Access-Control-Allow-Origin', base);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  const cachePolicy = 'public, s-maxage=300, stale-while-revalidate=600';
  res.setHeader('Cache-Control', cachePolicy);
  res.setHeader('Vercel-CDN-Cache-Control', cachePolicy);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const kgByName = new Map();
    let startingAfter;
    let hasMore = true;

    while (hasMore) {
      const page = await stripe.checkout.sessions.list({
        status: 'complete',
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      for (const session of page.data) {
        if (
          session.metadata?.opt_out === 'true' ||
          !['paid', 'no_payment_required'].includes(session.payment_status)
        ) {
          continue;
        }

        const kg = Number(session.metadata?.emissao_kg);
        if (!Number.isFinite(kg) || kg <= 0) continue;

        const name = sanitizeName(session.metadata?.nome);
        kgByName.set(name, (kgByName.get(name) || 0) + kg);
      }

      hasMore = page.has_more;
      if (hasMore && page.data.length > 0) {
        startingAfter = page.data[page.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }

    const contributors = Array.from(kgByName, ([name, kg]) => ({ name, kg }))
      .sort((a, b) => b.kg - a.kg);

    // Sessões de checkout registram o primeiro pagamento; renovações exigiriam agregar invoice.paid.
    // TODO: integrar as renovações de assinatura quando a contabilidade de rodadas passar a incluí-las.
    // TODO: separar sessões já compensadas por metadata ou data de corte quando houver mais de uma rodada.
    return res.status(200).json({
      total_kg: contributors.reduce((total, contributor) => total + contributor.kg, 0),
      total_contributors: contributors.length,
      contributors,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ERRO_STRIPE_CONTRIBUINTES', error.type, error.code);
    return res.status(500).json({ erro: 'Unable to load contributors' });
  }
}
