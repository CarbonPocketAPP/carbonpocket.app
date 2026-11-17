import { and, eq, isNull, sql } from 'drizzle-orm';
import { attestations } from '../../lib/schema.js';
import { db } from '../../lib/db.js';
import { contributionsAuthorizationError } from '../../lib/mobile.js';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

// Somente REFUND e chargeback devem chamar esta rota; cancelar renovação não é devolução.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const authorizationError = contributionsAuthorizationError(req);
  if (authorizationError) {
    const status = authorizationError === 'server_misconfigured' ? 500 : 401;
    return res.status(status).json({ error: authorizationError });
  }

  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      typeof body.transactionId !== 'string' || body.transactionId.length === 0 || body.transactionId.length > 255 ||
      typeof body.reason !== 'string' || body.reason.trim().length === 0 || body.reason.length > 120 ||
      typeof body.occurredAt !== 'string' || !ISO_DATE.test(body.occurredAt) || !Number.isFinite(Date.parse(body.occurredAt))) {
    return res.status(400).json({ error: 'invalid_payload' });
  }

  try {
    const paymentReference = 'rc:' + body.transactionId;
    const reversed = await db.update(attestations)
      .set({ reversedAt: sql.raw('now()'), reversalReason: body.reason.trim() })
      .where(and(
        eq(attestations.paymentReference, paymentReference),
        isNull(attestations.reversedAt),
      ))
      .returning({ id: attestations.id });
    if (reversed.length === 0) return res.status(404).json({ error: 'not_found' });
    return res.status(200).json({ reversed: true });
  } catch (error) {
    console.error('ERRO_REVERSAO_CONTRIBUICAO_MOVEL', { error: error?.name || 'Error' });
    return res.status(500).json({ error: 'internal_error' });
  }
}
