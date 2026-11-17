import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from './db.js';
import { attestations } from './schema.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

export function contributionsAuthorizationError(req) {
      const expected = process.env.CONTRIBUTIONS_INGEST_TOKEN;
      if (!expected) {
        console.error('ERRO_CONFIGURACAO_TOKEN_INGESTAO_AUSENTE');
        return 'server_misconfigured';
      }
      const authorization = req.headers?.authorization;
      if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) return 'unauthorized';
      const candidate = authorization.slice(7);
      if (!candidate) return 'unauthorized';
      // Hashes de tamanho fixo permitem comparação constante sem expor o token.
      const expectedHash = createHash('sha256').update(expected).digest();
      const candidateHash = createHash('sha256').update(candidate).digest();
      return timingSafeEqual(candidateHash, expectedHash) ? null : 'unauthorized';
    }

function generateCode() {
  // Mantém o mesmo alfabeto, formato, randomBytes e amostragem do fluxo Stripe.
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
  return 'CP-' + new Date().getFullYear() + '-' + suffix;
}

export function sanitizePublicDisplayName(value) {
  if (typeof value !== 'string') return null;
  const name = value.replace(/<[^>]*>/g, '').replace(/[<>]/g, '')
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
    .replace(/\s+/g, ' ').trim().slice(0, 60).trim();
  return name || null;
}

const RETURN_FIELDS = {
  code: attestations.code,
  kg: attestations.kg,
  status: attestations.status,
  issuedAt: attestations.issuedAt,
};

export async function registrarContribuicaoMovel(input) {
  const paymentReference = 'rc:' + input.transactionId;
  const row = {
    code: '',
    paymentReference,
    amountCents: input.priceCents,
    currency: input.currency,
    kg: input.kg,
    tonnesAttributed: input.kg / 1000,
    status: 'pending_batch',
    batchId: null,
    userId: null,
    externalUserId: input.externalUserId,
    productId: input.productId,
    source: input.source,
    publicDisplayName: sanitizePublicDisplayName(input.displayName),
    consentToPublish: input.consentToPublish === true,
    issuedAt: new Date(input.purchasedAt),
  };

  let lastCollision;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    row.code = generateCode();
    const inserted = await db.insert(attestations).values(row).onConflictDoNothing().returning(RETURN_FIELDS);
    if (inserted.length > 0) return { created: true, contribution: inserted[0] };

    // O índice parcial de payment_reference também pode sinalizar reenvio idempotente.
    const [existing] = await db.select(RETURN_FIELDS).from(attestations)
      .where(eq(attestations.paymentReference, paymentReference)).limit(1);
    if (existing) {
      console.info('CONTRIBUICAO_MOVEL_DUPLICADA');
      return { created: false, contribution: existing };
    }
    lastCollision = new Error('Colisão ao gerar identificador interno.');
  }
  throw lastCollision;
}
