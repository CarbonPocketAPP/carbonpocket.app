import { timingSafeEqual } from 'node:crypto';

export default async function handler(req, res) {
  res.setHeader('Allow', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'x-health-key');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false });
  }

  const expectedKey = process.env.HEALTH_KEY;
  const suppliedKey = req.headers['x-health-key'];
  const expectedBytes = typeof expectedKey === 'string'
    ? Buffer.from(expectedKey)
    : Buffer.alloc(0);
  const suppliedBytes = typeof suppliedKey === 'string'
    ? Buffer.from(suppliedKey)
    : Buffer.alloc(0);
  if (
    expectedBytes.length === 0 ||
    typeof suppliedKey !== 'string' ||
    suppliedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(suppliedBytes, expectedBytes)
  ) {
    return res.status(401).json({ ok: false });
  }

  return res.status(200).json({ ok: true });
}
