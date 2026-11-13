import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from './db.js';
import { attestations } from './schema.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

function generateCode() {
  const alphabetLength = CODE_ALPHABET.length;
  const rejectionLimit = Math.floor(256 / alphabetLength) * alphabetLength;
  let suffix = '';

  while (suffix.length < CODE_LENGTH) {
    for (const byte of randomBytes(16)) {
      if (byte < rejectionLimit) {
        suffix += CODE_ALPHABET[byte % alphabetLength];
        if (suffix.length === CODE_LENGTH) break;
      }
    }
  }

  return `CP-${new Date().getFullYear()}-${suffix}`;
}

export async function registrarContribuicao({ session }) {
  const rawKg = session?.metadata?.emissao_kg;
  const parsedKg = Number(rawKg);
  if (
    rawKg === null ||
    rawKg === undefined ||
    String(rawKg).trim() === '' ||
    !Number.isFinite(parsedKg) ||
    parsedKg <= 0
  ) {
    console.warn('CONTRIBUICAO_SEM_METADATA', {
      sessionId: session?.id ?? null,
    });
    return false;
  }

  if (typeof session.id !== 'string' || session.id.length === 0) {
    throw new TypeError('Stripe Checkout session id is required');
  }

  const kg = Math.min(100000, Math.max(25, Math.round(parsedKg)));
  const row = {
    code: '',
    paymentReference: session.id,
    amountCents: session.amount_total,
    currency: session.currency ?? null,
    kg,
    tonnesAttributed: kg / 1000,
    status: 'pending_batch',
    batchId: null,
    userId: null,
    consentToPublish: false,
  };

  let lastCollision;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    row.code = generateCode();
    const inserted = await db
      .insert(attestations)
      .values(row)
      .onConflictDoNothing()
      .returning({ id: attestations.id });

    if (inserted.length === 0) {
      // O índice de pagamento é parcial; após DO NOTHING, a consulta distingue reenvio de colisão do identificador interno.
      const [existing] = await db
        .select({ id: attestations.id })
        .from(attestations)
        .where(eq(attestations.paymentReference, session.id))
        .limit(1);
      if (existing) {
        console.log('CONTRIBUICAO_DUPLICADA', { sessionId: session.id });
        return false;
      }
      lastCollision = new Error('Colisão ao gerar identificador interno.');
      continue;
    }
    return true;
  }

  throw lastCollision;
}
