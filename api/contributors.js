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
    const paisStats = new Map();
    const kgByName = new Map();

    function addContribution({ kg, year, country, name, optedOut, sessions }) {
      const contributorName = optedOut ? 'Anonymous' : name;
      total.kg += kg;
      total.contributors.add(contributorName);
      total.sessions += sessions;

      const originStat = origemStats.get('site') || {
        kg: 0,
        contributors: new Set(),
        sessions: 0,
      };
      originStat.kg += kg;
      originStat.contributors.add(contributorName);
      originStat.sessions += sessions;
      origemStats.set('site', originStat);

      const yearStat = anoStats.get(year) || {
        kg: 0,
        contributors: new Set(),
        sessions: 0,
      };
      yearStat.kg += kg;
      yearStat.contributors.add(contributorName);
      yearStat.sessions += sessions;
      anoStats.set(year, yearStat);

      const matrixKey = `${year}:site`;
      const matrixStat = matrizStats.get(matrixKey) || {
        ano: year,
        origem: 'site',
        kg: 0,
        sessions: 0,
      };
      matrixStat.kg += kg;
      matrixStat.sessions += sessions;
      matrizStats.set(matrixKey, matrixStat);

      const countryStat = paisStats.get(country) || {
        kg: 0,
        contributors: new Set(),
        sessions: 0,
      };
      countryStat.kg += kg;
      countryStat.contributors.add(contributorName);
      countryStat.sessions += sessions;
      paisStats.set(country, countryStat);

      kgByName.set(contributorName, (kgByName.get(contributorName) || 0) + kg);
    }

    async function forEachPage(listPage, visit) {
      let startingAfter;
      let hasMore = true;
      while (hasMore) {
        const page = await listPage(startingAfter);
        for (const item of page.data) visit(item);
        hasMore = page.has_more;
        if (hasMore && page.data.length > 0) {
          startingAfter = page.data[page.data.length - 1].id;
        } else {
          hasMore = false;
        }
      }
    }

    await forEachPage(
      (startingAfter) => stripe.checkout.sessions.list({
        status: 'complete',
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      }),
      (session) => {
        if (
          session.mode !== 'payment' ||
          !['paid', 'no_payment_required'].includes(session.payment_status)
        ) {
          return;
        }

        // Sessões sem origem são históricas do site; quando o app criar sessões, elas terão origem = 'app'.
        if (session.metadata?.origem && session.metadata.origem !== 'site') return;
        const kg = Number(session.metadata?.emissao_kg);
        const year = new Date(session.created * 1000).getFullYear();
        if (!Number.isFinite(kg) || kg <= 0 || !Number.isFinite(year)) return;

        const countryCode = String(session.metadata?.pais || '').toUpperCase();
        const country = /^[A-Z]{2}$/.test(countryCode) ? countryCode : 'nao_informado';
        addContribution({
          kg,
          year,
          country,
          name: sanitizeName(session.metadata?.nome),
          optedOut: session.metadata?.opt_out === 'true',
          sessions: 1,
        });
      },
    );

    await forEachPage(
      (startingAfter) => stripe.subscriptions.list({
        status: 'all',
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      }),
      (subscription) => {
        const metadata = subscription.metadata || {};
        // Sessões antigas sem origem são do site; quando o app criar assinaturas, exigir origem = 'site'.
        if (metadata.origem && metadata.origem !== 'site') return;

        let kgPorAno;
        try {
          kgPorAno = JSON.parse(metadata.kg_por_ano || '{}');
        } catch (error) {
          console.warn('CONTRIBUINTE_KG_POR_ANO_INVALIDO', subscription.id, error.name);
          return;
        }
        if (!kgPorAno || typeof kgPorAno !== 'object' || Array.isArray(kgPorAno)) return;

        let invoicesPorAno = {};
        try {
          const parsed = JSON.parse(metadata.faturas_por_ano || '{}');
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            invoicesPorAno = parsed;
          }
        } catch (error) {
          console.warn('CONTRIBUINTE_FATURAS_POR_ANO_INVALIDO', subscription.id, error.name);
        }

        const countryCode = String(metadata.pais || '').toUpperCase();
        const country = /^[A-Z]{2}$/.test(countryCode) ? countryCode : 'nao_informado';
        for (const [yearText, rawKg] of Object.entries(kgPorAno)) {
          const year = Number(yearText);
          const kg = Number(rawKg);
          if (!/^\d{4}$/.test(yearText) || !Number.isFinite(kg) || kg <= 0) continue;

          const storedInvoices = Number(invoicesPorAno[yearText]);
          addContribution({
            kg,
            year,
            country,
            name: sanitizeName(metadata.nome),
            optedOut: metadata.opt_out === 'true',
            sessions: Number.isFinite(storedInvoices) && storedInvoices > 0
              ? Math.floor(storedInvoices)
              : 1,
          });
        }
      },
    );

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
    const porPais = Array.from(paisStats, ([pais, stats]) => ({
      pais,
      kg: stats.kg,
      contributors: stats.contributors.size,
      sessions: stats.sessions,
    })).sort((a, b) => b.kg - a.kg);

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
      por_pais: porPais,
      contributors,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ERRO_STRIPE_CONTRIBUINTES', error.type, error.code);
    return res.status(500).json({ erro: 'Unable to load contributors' });
  }
}
