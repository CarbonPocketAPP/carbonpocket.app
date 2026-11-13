import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../lib/db.js';
import { attestations, retirementBatches } from '../lib/schema.js';

export default async function handler(req, res) {
  const base = String(process.env.SITE_URL || '').replace(/\/$/, '');
  const cachePolicy = 'public, s-maxage=300, stale-while-revalidate=600';

  res.setHeader('Access-Control-Allow-Origin', base);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', cachePolicy);
  res.setHeader('Vercel-CDN-Cache-Control', cachePolicy);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const rows = await db
      .select({
        cycle: retirementBatches.cycle,
        retirementDate: retirementBatches.retirementDate,
        projectName: retirementBatches.projectName,
        projectId: retirementBatches.projectId,
        methodologyId: retirementBatches.methodologyId,
        vintageRange: retirementBatches.vintageRange,
        serialStart: retirementBatches.serialStart,
        serialEnd: retirementBatches.serialEnd,
        registryTransactionId: retirementBatches.registryTransactionId,
        registryUrl: retirementBatches.registryUrl,
        totalTonnes: retirementBatches.totalTonnes,
        contributorCount: sql`count(${attestations.id})`,
        totalKgCompensado: sql`coalesce(sum(${attestations.kg}), 0)`,
      })
      .from(retirementBatches)
      .leftJoin(attestations, eq(attestations.batchId, retirementBatches.id))
      .where(eq(retirementBatches.status, 'published'))
      .groupBy(retirementBatches.id)
      .orderBy(desc(retirementBatches.cycle));

    const rounds = rows.map((row) => {
      const totalTonnes = Number(row.totalTonnes);
      const totalKgCompensado = Number(row.totalKgCompensado);
      return {
        cycle: row.cycle,
        retirementDate: row.retirementDate,
        projectName: row.projectName,
        projectId: row.projectId,
        methodologyId: row.methodologyId,
        vintageRange: row.vintageRange,
        serialRange: [
          row.serialStart === null ? null : String(row.serialStart),
          row.serialEnd === null ? null : String(row.serialEnd),
        ],
        registryTransactionId: row.registryTransactionId,
        registryUrl: row.registryUrl,
        totalTonnes,
        contributorCount: Number(row.contributorCount),
        aggregates: {
          totalKgCompensado,
          roundingDelta: totalTonnes * 1000 - totalKgCompensado,
        },
      };
    });

    return res.status(200).json({ rounds });
  } catch (error) {
    console.error('ERRO_BANCO_LEDGER', error.name);
    return res.status(503).json({ error: 'ledger_unavailable' });
  }
}
