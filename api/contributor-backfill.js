import { timingSafeEqual } from 'node:crypto';
import Stripe from 'stripe';
import {
  initialContributorBackfillCursor,
  processContributorBackfillBatch,
} from '../lib/contributor-backfill.js';
import { db } from '../lib/db.js';

function isCursorId(value) {
  return value === null ||
    (typeof value === 'string' && value.length > 0 && value.length <= 255);
}

function readCursor(value) {
  if (value === undefined || value === null) {
    return initialContributorBackfillCursor();
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const { phase, checkoutAfter, subscriptionAfter, subscriptionId, invoiceAfter } = value;
  if (
    !['checkouts', 'subscriptions'].includes(phase) ||
    !isCursorId(checkoutAfter) ||
    !isCursorId(subscriptionAfter) ||
    !isCursorId(subscriptionId) ||
    !isCursorId(invoiceAfter)
  ) {
    return null;
  }

  if (
    (phase === 'checkouts' &&
      (subscriptionAfter !== null || subscriptionId !== null || invoiceAfter !== null)) ||
    (phase === 'subscriptions' && checkoutAfter !== null) ||
    (invoiceAfter !== null && subscriptionId === null)
  ) {
    return null;
  }

  return { phase, checkoutAfter, subscriptionAfter, subscriptionId, invoiceAfter };
}

function isAuthorized(req) {
  const expectedKey = process.env.CONTRIBUTOR_BACKFILL_KEY;
  const suppliedKey = req.headers['x-contributor-backfill-key'];
  if (
    typeof expectedKey !== 'string' ||
    Buffer.byteLength(expectedKey) < 32 ||
    typeof suppliedKey !== 'string'
  ) {
    return false;
  }
  const expected = Buffer.from(expectedKey);
  const supplied = Buffer.from(suppliedKey);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Allow', 'POST');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'invalid_request' });
    }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'invalid_request' });
  }

  const cursor = readCursor(body.cursor);
  if (!cursor) {
    return res.status(400).json({ error: 'invalid_cursor' });
  }
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.DATABASE_URL ||
    typeof process.env.CONTRIBUTOR_IDENTITY_SECRET !== 'string' ||
    Buffer.byteLength(process.env.CONTRIBUTOR_IDENTITY_SECRET) < 32
  ) {
    return res.status(503).json({ error: 'backfill_not_configured' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const result = await processContributorBackfillBatch(stripe, db, cursor);
    return res.status(200).json({
      done: result.done,
      processed: result.processed,
      nextCursor: result.done ? null : result.cursor,
    });
  } catch (error) {
    console.error('CONTRIBUTOR_LEDGER_BACKFILL_BATCH_FAILED', {
      phase: cursor.phase,
      error: error.name,
    });
    return res.status(500).json({ error: 'backfill_batch_failed' });
  }
}
