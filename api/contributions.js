import { MOBILE_CATALOG } from '../lib/mobile-catalog.js';
import { contributionsAuthorizationError, registrarContribuicaoMovel } from '../lib/mobile.js';

const REQUIRED_FIELDS = [
  'source', 'transactionId', 'productId', 'store', 'priceCents', 'currency',
  'purchasedAt', 'eventType', 'environment', 'externalUserId', 'displayName',
  'consentToPublish',
];
const MAX_BODY_BYTES = 8192;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function invalidPayload(res) {
  return res.status(400).json({ error: 'invalid_payload' });
}

function parseBody(req) {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return req.body;
}

function isValidPayload(body) {
  return typeof body.transactionId === 'string' && body.transactionId.length > 0 && body.transactionId.length <= 255 &&
    typeof body.productId === 'string' && body.productId.length > 0 && body.productId.length <= 255 &&
    typeof body.store === 'string' && body.store.length > 0 && body.store.length <= 64 &&
    Number.isInteger(body.priceCents) && body.priceCents >= 0 && body.currency === 'BRL' &&
    typeof body.purchasedAt === 'string' && ISO_DATE.test(body.purchasedAt) && Number.isFinite(Date.parse(body.purchasedAt)) &&
    typeof body.eventType === 'string' && body.eventType.length > 0 && body.eventType.length <= 64 &&
    (body.environment === 'SANDBOX' || body.environment === 'PRODUCTION') &&
    typeof body.externalUserId === 'string' && body.externalUserId.length > 0 && body.externalUserId.length <= 255 &&
    (body.displayName === null || typeof body.displayName === 'string') &&
    typeof body.consentToPublish === 'boolean';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const authorizationError = contributionsAuthorizationError(req);
  if (authorizationError) {
    const status = authorizationError === 'server_misconfigured' ? 500 : 401;
    return res.status(status).json({ error: authorizationError });
  }

  const body = parseBody(req);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return invalidPayload(res);
  let bodyBytes;
  try { bodyBytes = Buffer.byteLength(JSON.stringify(body)); } catch { return invalidPayload(res); }
  if (bodyBytes > MAX_BODY_BYTES) return res.status(413).json({ error: 'payload_too_large' });
  if (REQUIRED_FIELDS.some((field) => !Object.prototype.hasOwnProperty.call(body, field))) return invalidPayload(res);
  if (!isValidPayload(body)) return invalidPayload(res);
  if (body.source !== 'ios' && body.source !== 'android') {
    return res.status(400).json({ error: 'invalid_source' });
  }

  // Compras sandbox são ignoradas antes de consultar o catálogo ou acessar o banco.
  if (body.environment === 'SANDBOX' && process.env.CONTRIBUTIONS_ALLOW_SANDBOX !== 'true') {
    return res.status(200).json({ recorded: false, reason: 'sandbox' });
  }
  const product = MOBILE_CATALOG[body.productId];
  if (!product) return res.status(409).json({ error: 'unknown_product' });

  try {
    const result = await registrarContribuicaoMovel({
      transactionId: body.transactionId,
      productId: body.productId,
      source: body.source,
      externalUserId: body.externalUserId,
      priceCents: body.priceCents,
      currency: body.currency,
      purchasedAt: body.purchasedAt,
      displayName: body.displayName,
      consentToPublish: body.consentToPublish,
      kg: product.kg,
    });
    const contribution = result.contribution;
    const response = {
      reference: contribution.code,
      kg: contribution.kg,
      status: contribution.status,
      issuedAt: contribution.issuedAt instanceof Date
        ? contribution.issuedAt.toISOString()
        : new Date(contribution.issuedAt).toISOString(),
    };
    if (result.created) return res.status(201).json(response);
    return res.status(200).json({ ...response, duplicate: true });
  } catch (error) {
    console.error('ERRO_INGESTAO_CONTRIBUICAO_MOVEL', { error: error?.name || 'Error' });
    return res.status(500).json({ error: 'internal_error' });
  }
}
