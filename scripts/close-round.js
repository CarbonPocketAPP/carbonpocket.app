import { and, eq, isNull, sql } from 'drizzle-orm';
import { attestations, retirementBatches } from '../lib/schema.js';
import { createUnpooledDatabase } from './db-unpooled.js';

const cycle = process.argv[2];

function projectDetailsFromEnvironment() {
  const details = {
    projectName: process.env.COMPENSATION_PROJECT_NAME,
    projectId: process.env.COMPENSATION_PROJECT_ID,
    methodologyId: process.env.COMPENSATION_METHODOLOGY_ID,
    vintageRange: process.env.COMPENSATION_VINTAGE_RANGE,
  };
  const missing = Object.entries(details)
    .filter(([, value]) => !value?.trim())
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Informe dados verificados do projeto em COMPENSATION_PROJECT_NAME, COMPENSATION_PROJECT_ID, COMPENSATION_METHODOLOGY_ID e COMPENSATION_VINTAGE_RANGE antes de criar uma rodada: ${missing.join(', ')}`,
    );
  }

  return details;
}

async function main() {
  if (!/^\d{4}-\d{2}$/.test(cycle || '')) {
    console.error('Uso: node scripts/close-round.js AAAA-MM');
    process.exitCode = 1;
    return;
  }

  const { db, pool } = createUnpooledDatabase();
  try {
    const [pending] = await db
      .select({
        totalKg: sql`coalesce(sum(${attestations.kg}), 0)`,
      })
      .from(attestations)
      .where(and(
        eq(attestations.status, 'pending_batch'),
        isNull(attestations.batchId),
      ));

    const totalKg = Number(pending.totalKg);
    if (totalKg === 0) {
      console.log('Nenhuma contribuição pendente para fechar.');
      return;
    }
    if (!Number.isSafeInteger(totalKg) || totalKg < 0) {
      throw new Error('A soma de kg pendentes está fora do intervalo seguro.');
    }

    const totalTonnes = Math.ceil(totalKg / 1000);
    const roundingDelta = totalTonnes * 1000 - totalKg;
    console.log('ARREDONDAMENTO_RODADA', {
      cycle,
      totalKg,
      totalTonnes,
      roundingDelta,
    });

    await db.transaction(async (tx) => {
      let [batch] = await tx
        .select()
        .from(retirementBatches)
        .where(and(
          eq(retirementBatches.cycle, cycle),
          eq(retirementBatches.registry, 'verra'),
        ))
        .for('update');

      if (!batch) {
        const inserted = await tx
          .insert(retirementBatches)
          .values({
            cycle,
            registry: 'verra',
            totalTonnes,
            status: 'planned',
            ...projectDetailsFromEnvironment(),
          })
          .onConflictDoNothing({
            target: [retirementBatches.cycle, retirementBatches.registry],
          })
          .returning();

        [batch] = inserted;
        if (!batch) {
          [batch] = await tx
            .select()
            .from(retirementBatches)
            .where(and(
              eq(retirementBatches.cycle, cycle),
              eq(retirementBatches.registry, 'verra'),
            ))
            .for('update');
        }
      }

      if (!batch) {
        throw new Error('Não foi possível bloquear ou criar a rodada.');
      }
      if (batch.status !== 'planned') {
        throw new Error('A rodada já foi aposentada ou publicada.');
      }

      await tx
        .update(attestations)
        .set({
          batchId: batch.id,
          status: 'attributed',
        })
        .where(and(
          eq(attestations.status, 'pending_batch'),
          isNull(attestations.batchId),
        ));
    });

    console.log('RODADA_FECHADA', { cycle, totalKg, totalTonnes });
  } finally {
    await pool.end();
  }
}

await main();
