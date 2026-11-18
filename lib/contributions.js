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

async function createContribution({ paymentReference, amountCents, currency, rawKg }) {
  const parsedKg = Number(rawKg);
  if (
    rawKg === null ||
    rawKg === undefined ||
    String(rawKg).trim() === '' ||
    !Number.isFinite(parsedKg) ||
    parsedKg <= 0
  ) {
    return { created: false };
  }

  const kg = Math.min(100000, Math.max(25, Math.round(parsedKg)));
  const row = {
    code: '',
    paymentReference,
    amountCents,
    currency: currency ?? null,
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
      .returning({ id: attestations.id, code: attestations.code, kg: attestations.kg });

    if (inserted.length === 0) {
      // O índice de pagamento é parcial; após DO NOTHING, a consulta distingue reenvio de colisão do identificador interno.
      const [existing] = await db
        .select({ code: attestations.code, kg: attestations.kg })
        .from(attestations)
        .where(eq(attestations.paymentReference, paymentReference))
        .limit(1);
      if (existing) {
        console.log('CONTRIBUICAO_DUPLICADA', { paymentReference });
        return { created: false, code: existing.code, kg: existing.kg };
      }
      lastCollision = new Error('Colisão ao gerar identificador interno.');
      continue;
    }
    return { created: true, code: inserted[0].code, kg: inserted[0].kg };
  }

  throw lastCollision;
}

export async function registrarContribuicao({ session }) {
  if (typeof session?.id !== 'string' || session.id.length === 0) {
    throw new TypeError('Stripe Checkout session id is required');
  }

  const result = await createContribution({
    paymentReference: session.id,
    amountCents: session.amount_total,
    currency: session.currency,
    rawKg: session.metadata?.emissao_kg,
  });
  if (!result.code && !result.created) {
    console.warn('CONTRIBUICAO_SEM_METADATA', { sessionId: session.id });
  }
  return result;
}

export async function registrarContribuicaoFatura({ invoice, kg }) {
  if (typeof invoice?.id !== 'string' || invoice.id.length === 0) {
    throw new TypeError('Stripe invoice id is required');
  }
  if (invoice.status !== 'paid') {
    return { created: false };
  }

  const result = await createContribution({
    paymentReference: invoice.id,
    amountCents: invoice.amount_paid,
    currency: invoice.currency,
    rawKg: kg,
  });
  if (!result.code && !result.created) {
    console.warn('CONTRIBUICAO_FATURA_SEM_VOLUME', { invoiceId: invoice.id });
  }
  return result;
}
