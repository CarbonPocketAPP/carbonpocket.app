import { asc, eq } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { contributorPayments, contributorProfiles } from '../lib/schema.js';

export default async function handler(req, res) {
  const base = String(process.env.SITE_URL || '').replace(/\/$/, '');

  res.setHeader('Access-Control-Allow-Origin', base);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'private, no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Method not allowed' });
  }

  try {
    const rows = await db
      .select({
        paymentId: contributorPayments.id,
        contributorId: contributorProfiles.id,
        name: contributorProfiles.displayName,
        consentToPublish: contributorProfiles.consentToPublish,
        kg: contributorPayments.kg,
        country: contributorPayments.country,
        planType: contributorPayments.planType,
        occurredAt: contributorPayments.occurredAt,
        coverageStart: contributorPayments.coverageStart,
        coverageEnd: contributorPayments.coverageEnd,
      })
      .from(contributorPayments)
      .leftJoin(
        contributorProfiles,
        eq(contributorPayments.contributorId, contributorProfiles.id),
      )
      .orderBy(asc(contributorPayments.occurredAt));

    const yearStats = new Map();
    const countryStats = new Map();
    const matrixStats = new Map();
    const contributorsById = new Map();
    let totalKg = 0;

    function addStatistic(map, key, kg, contributorKey) {
      const statistic = map.get(key) || {
        kg: 0,
        contributors: new Set(),
      };
      statistic.kg += kg;
      statistic.contributors.add(contributorKey);
      map.set(key, statistic);
    }

    for (const row of rows) {
      const kg = Number(row.kg);
      const occurredAt = row.occurredAt;
      if (!Number.isFinite(kg) || kg <= 0 || !(occurredAt instanceof Date)) continue;
      const publicProfile = Boolean(
        row.contributorId && row.consentToPublish && row.name && row.name !== 'Anonymous',
      );
      const contributorKey = publicProfile ? `profile:${row.contributorId}` : 'anonymous';
      const year = occurredAt.getUTCFullYear();
      const country = /^[A-Z]{2}$/.test(row.country) ? row.country : 'nao_informado';
      totalKg += kg;
      addStatistic(yearStats, year, kg, contributorKey);
      addStatistic(countryStats, country, kg, contributorKey);
      addStatistic(matrixStats, `${year}:site`, kg, contributorKey);

      if (!publicProfile) continue;

      let profile = contributorsById.get(row.contributorId);
      if (!profile) {
        profile = {
          name: row.name,
          kg: 0,
          contributedAt: 0,
          countries: new Set(),
          planTypes: new Set(),
          paidMonths: new Set(),
        };
        contributorsById.set(row.contributorId, profile);
      }

      const occurredAtSeconds = Math.floor(occurredAt.getTime() / 1000);
      profile.kg += kg;
      profile.contributedAt = Math.max(profile.contributedAt, occurredAtSeconds);
      profile.countries.add(country);
      if (row.planType === 'mensal' || row.planType === 'anual') {
        profile.planTypes.add(row.planType);
      }
      if (
        row.planType === 'anual' &&
        row.coverageStart instanceof Date &&
        row.coverageEnd instanceof Date
      ) {
        const monthCursor = new Date(Date.UTC(
          row.coverageStart.getUTCFullYear(),
          row.coverageStart.getUTCMonth(),
          1,
        ));
        const coveredUntil = new Date(row.coverageEnd.getTime() - 1);
        const lastCoveredMonth = Date.UTC(
          coveredUntil.getUTCFullYear(),
          coveredUntil.getUTCMonth(),
          1,
        );
        while (monthCursor.getTime() <= lastCoveredMonth) {
          profile.paidMonths.add(
            `${monthCursor.getUTCFullYear()}-${String(monthCursor.getUTCMonth() + 1).padStart(2, '0')}`,
          );
          monthCursor.setUTCMonth(monthCursor.getUTCMonth() + 1);
        }
      } else {
        profile.paidMonths.add(
          `${year}-${String(occurredAt.getUTCMonth() + 1).padStart(2, '0')}`,
        );
      }
    }

    function consecutiveMonthStreak(months, currentMonth) {
      const ordered = Array.from(months).sort().reverse();
      if (ordered.length === 0) return 0;
      const [currentYear, currentMonthNumber] = currentMonth.split('-').map(Number);
      const [latestYear, latestMonthNumber] = ordered[0].split('-').map(Number);
      const latestIndex = latestYear * 12 + latestMonthNumber;
      const currentIndex = currentYear * 12 + currentMonthNumber;
      if (currentIndex - latestIndex > 1) return 0;

      let streak = 1;
      let previousIndex = latestIndex;
      for (const month of ordered.slice(1)) {
        const [year, monthNumber] = month.split('-').map(Number);
        const index = year * 12 + monthNumber;
        if (previousIndex - index !== 1) break;
        streak += 1;
        previousIndex = index;
      }
      return streak;
    }

    const now = new Date();
    const currentMonth =
      `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const contributors = Array.from(contributorsById.values())
      .map((profile) => ({
        name: profile.name,
        kg: profile.kg,
        contributedAt: profile.contributedAt,
        countries: Array.from(profile.countries),
        planTypes: Array.from(profile.planTypes),
        monthsContributing: profile.paidMonths.size,
        streak: consecutiveMonthStreak(profile.paidMonths, currentMonth),
      }))
      .sort((a, b) => b.contributedAt - a.contributedAt || b.kg - a.kg);

    const porAno = Array.from(yearStats, ([ano, statistic]) => ({
      ano,
      kg: statistic.kg,
      contributors: statistic.contributors.size,
    })).sort((a, b) => b.ano - a.ano);
    const porPais = Array.from(countryStats, ([pais, statistic]) => ({
      pais,
      kg: statistic.kg,
      contributors: statistic.contributors.size,
    })).sort((a, b) => b.kg - a.kg);
    const matriz = Array.from(matrixStats, ([key, statistic]) => {
      const [ano, origem] = key.split(':');
      return {
        ano: Number(ano),
        origem,
        kg: statistic.kg,
        contributors: statistic.contributors.size,
      };
    }).sort((a, b) => b.ano - a.ano || a.origem.localeCompare(b.origem));

    return res.status(200).json({
      total: {
        kg: totalKg,
        contributors: contributors.length,
      },
      por_origem: [{
        origem: 'site',
        kg: totalKg,
        contributors: contributors.length,
      }],
      por_ano: porAno,
      matriz,
      por_pais: porPais,
      contributors,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ERRO_NEON_CONTRIBUINTES', error?.name);
    return res.status(500).json({ erro: 'Unable to load contributors' });
  }
}
