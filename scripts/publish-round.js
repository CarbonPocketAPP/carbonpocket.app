import { and, eq } from 'drizzle-orm';
import { attestations, retirementBatches } from '../lib/schema.js';
import { createUnpooledDatabase } from './db-unpooled.js';

const [
  cycle,
  registryTransactionId,
  serialStartText,
  serialEndText,
  retirementDate,
  beneficiaryField,
] = process.argv.slice(2);

function parseSerial(value) {
  if (!/^\d+$/.test(value || '')) return null;
  const serial = BigInt(value);
  return serial <= 9223372036854775807n ? serial : null;
}

async function main() {
  const serialStart = parseSerial(serialStartText);
  const serialEnd = parseSerial(serialEndText);
  const parsedDate = new Date(`${retirementDate}T00:00:00.000Z`);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(retirementDate || '') &&
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === retirementDate;

  if (
    !/^\d{4}-\d{2}$/.test(cycle || '') ||
    !registryTransactionId?.trim() ||
    serialStart === null ||
    serialEnd === null ||
    serialStart > serialEnd ||
    !validDate ||
    !beneficiaryField?.trim()
  ) {
    console.error(
      'Uso: node scripts/publish-round.js AAAA-MM TRANSACTION_ID SERIAL_START SERIAL_END AAAA-MM-DD BENEFICIARY',
    );
    process.exitCode = 1;
    return;
  }

  const { db, pool } = createUnpooledDatabase();
  try {
    await db.transaction(async (tx) => {
      const [batch] = await tx
        .select()
        .from(retirementBatches)
        .where(and(
          eq(retirementBatches.cycle, cycle),
          eq(retirementBatches.registry, 'verra'),
        ))
        .for('update');

      if (!batch) {
        throw new Error('A rodada não existe.');
      }
      if (batch.status === 'published') {
        throw new Error('A rodada já foi publicada.');
      }

      const [retired] = await tx
        .update(retirementBatches)
        .set({
          registryTransactionId,
          serialStart,
          serialEnd,
          retirementDate,
          beneficiaryField,
          status: 'retired',
        })
        .where(eq(retirementBatches.id, batch.id))
        .returning({ id: retirementBatches.id });

      await tx
        .update(retirementBatches)
        .set({ status: 'published' })
        .where(eq(retirementBatches.id, retired.id));

      await tx
        .update(attestations)
        .set({ status: 'published' })
        .where(eq(attestations.batchId, batch.id));
    });

    console.log('RODADA_PUBLICADA', { cycle });
  } finally {
    await pool.end();
  }
}

await main();
