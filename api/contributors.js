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
    const total = { kg: 0, contributors: new Set(), sessions: 0 };
    const origemStats = new Map();
    const anoStats = new Map();
    const matrizStats = new Map();
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
        if (!['paid', 'no_payment_required'].includes(session.payment_status)) {
          continue;
        }

        const kg = Number(session.metadata?.emissao_kg);
        if (!Number.isFinite(kg) || kg <= 0) continue;

        const name = sanitizeName(session.metadata?.nome);
        const origem = ['site', 'app'].includes(session.metadata?.origem)
          ? session.metadata.origem
          : 'nao_identificado';
        const ano = new Date(session.created * 1000).getFullYear();
        if (!Number.isFinite(ano)) continue;

        const optedOut = session.metadata?.opt_out === 'true';
        total.kg += kg;
        total.contributors.add(name);
        total.sessions += 1;

        const origemStat = origemStats.get(origem) || {
          kg: 0,
          contributors: new Set(),
          sessions: 0,
        };
        origemStat.kg += kg;
        origemStat.contributors.add(name);
        origemStat.sessions += 1;
        origemStats.set(origem, origemStat);

        const anoStat = anoStats.get(ano) || {
          kg: 0,
          contributors: new Set(),
          sessions: 0,
        };
        anoStat.kg += kg;
        anoStat.contributors.add(name);
        anoStat.sessions += 1;
        anoStats.set(ano, anoStat);

        const matrizKey = `${ano}:${origem}`;
        const matrizStat = matrizStats.get(matrizKey) || {
          ano,
          origem,
          kg: 0,
          sessions: 0,
        };
        matrizStat.kg += kg;
        matrizStat.sessions += 1;
        matrizStats.set(matrizKey, matrizStat);

        // Opt-out impede a publicação do nome, não apaga a compensação do total público.
        if (!optedOut) {
          kgByName.set(name, (kgByName.get(name) || 0) + kg);
        }
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
    const porOrigem = Array.from(origemStats, ([origem, stats]) => ({
      origem,
      kg: stats.kg,
      contributors: stats.contributors.size,
      sessions: stats.sessions,
    })).sort((a, b) => b.kg - a.kg);
    const porAno = Array.from(anoStats, ([ano, stats]) => ({
      ano,
      kg: stats.kg,
      contributors: stats.contributors.size,
      sessions: stats.sessions,
    })).sort((a, b) => b.ano - a.ano);
    const matriz = Array.from(matrizStats.values())
      .sort((a, b) => b.ano - a.ano || a.origem.localeCompare(b.origem));

    // Sessões de checkout registram o primeiro pagamento; renovações exigiriam agregar invoice.paid.
    // TODO: integrar as renovações de assinatura quando a contabilidade de rodadas passar a incluí-las.
    // TODO: separar sessões já compensadas por metadata ou data de corte quando houver mais de uma rodada.
    return res.status(200).json({
      total: {
        kg: total.kg,
        contributors: total.contributors.size,
        sessions: total.sessions,
      },
      por_origem: porOrigem,
      por_ano: porAno,
      matriz,
      contributors,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ERRO_STRIPE_CONTRIBUINTES', error.type, error.code);
    return res.status(500).json({ erro: 'Unable to load contributors' });
  }
}
