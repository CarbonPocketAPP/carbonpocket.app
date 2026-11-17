import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '../../lib/db.js';
import { attestations, retirementBatches } from '../../lib/schema.js';
import { contributionsAuthorizationError } from '../../lib/mobile.js';

const LIMITS = 'Compensation, not reduction: emissions still occur. Credits are retired in aggregate with other contributors. Not carbon neutral, not net zero, not an official inventory, not a CRVE, and not valid for SBCE compliance or NDC claims.';
const MAX_DEVICES = 10;

function parseDevices(queryValue) {
  if (typeof queryValue === 'string') return [queryValue];
  if (Array.isArray(queryValue) && queryValue.every((value) => typeof value === 'string')) return queryValue;
  return [];
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const authorizationError = contributionsAuthorizationError(req);
  if (authorizationError) {
    const status = authorizationError === 'server_misconfigured' ? 500 : 401;
    return res.status(status).json({ error: authorizationError });
  }
  if (req.headers?.origin !== undefined) return res.status(403).json({ error: 'origin_not_allowed' });

  const devices = parseDevices(req.query?.device);
  if (devices.length === 0 || devices.length > MAX_DEVICES ||
      devices.some((device) => device.length === 0 || device.length > 64)) {
    return res.status(400).json({ error: 'invalid_devices' });
  }

  try {
    const rows = await db.select({
      reference: attestations.code,
      kg: attestations.kg,
      status: attestations.status,
      issuedAt: attestations.issuedAt,
      productId: attestations.productId,
      batchId: attestations.batchId,
      batchCycle: retirementBatches.cycle,
      retirementDate: retirementBatches.retirementDate,
      registryTransactionId: retirementBatches.registryTransactionId,
      serialStart: retirementBatches.serialStart,
      serialEnd: retirementBatches.serialEnd,
      registryUrl: retirementBatches.registryUrl,
      projectName: retirementBatches.projectName,
      totalTonnes: retirementBatches.totalTonnes,
    })
      .from(attestations)
      .leftJoin(retirementBatches, eq(attestations.batchId, retirementBatches.id))
      .where(and(
        inArray(attestations.externalUserId, devices),
        isNull(attestations.reversedAt),
      ))
      .orderBy(desc(attestations.issuedAt));

    const contributions = rows.map((row) => ({
      reference: row.reference,
      kg: row.kg,
      status: row.status,
      issuedAt: row.issuedAt instanceof Date
        ? row.issuedAt.toISOString()
        : new Date(row.issuedAt).toISOString(),
      productId: row.productId,
      batch: row.batchId && row.batchCycle !== null
        ? {
            cycle: row.batchCycle,
            retirementDate: row.retirementDate,
            registryTransactionId: row.registryTransactionId,
            serialRange: [
              row.serialStart === null ? null : String(row.serialStart),
              row.serialEnd === null ? null : String(row.serialEnd),
            ],
            registryUrl: row.registryUrl,
            projectName: row.projectName,
            totalTonnes: row.totalTonnes === null ? null : Number(row.totalTonnes),
          }
        : null,
    }));

    return res.status(200).json({ limits: LIMITS, contributions });
  } catch (error) {
    console.error('ERRO_LISTAGEM_CONTRIBUICOES_MOVEL', { error: error?.name || 'Error' });
    return res.status(503).json({ error: 'contributions_unavailable' });
  }
}
