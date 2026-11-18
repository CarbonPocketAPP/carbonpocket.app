import { eq } from 'drizzle-orm';
import { sendContributionReceipt } from '../lib/receipt-email.js';
import { attestations } from '../lib/schema.js';
import { createUnpooledDatabase } from './db-unpooled.js';

function option(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? null : process.argv[index + 1] || null;
}

const code = option('--code');
const email = option('--email');

if (!code || !email || !/^CP-\d{4}-[A-HJ-NP-Z2-9]{8}$/.test(code)) {
  console.error('Usage: node scripts/test-receipt-email.js --code CP-YYYY-XXXXXXXX --email you@example.com');
  process.exitCode = 1;
} else {
  const { db, pool } = createUnpooledDatabase();
  try {
    const [contribution] = await db
      .select({
        code: attestations.code,
        kg: attestations.kg,
        publicDisplayName: attestations.publicDisplayName,
        receiptEmailSentAt: attestations.receiptEmailSentAt,
        reversedAt: attestations.reversedAt,
      })
      .from(attestations)
      .where(eq(attestations.code, code))
      .limit(1);

    if (!contribution) {
      throw new Error('No attestation found for the supplied code.');
    }
    if (contribution.receiptEmailSentAt || contribution.reversedAt) {
      throw new Error('Use a fresh, unreversed test attestation whose receipt has not been claimed.');
    }

    const options = {
      code,
      email,
      name: contribution.publicDisplayName || '',
      badge: '',
      plan: 'Receipt email test',
    };
    const first = await sendContributionReceipt(db, options);
    const [afterFirst] = await db
      .select({ receiptEmailSentAt: attestations.receiptEmailSentAt })
      .from(attestations)
      .where(eq(attestations.code, code))
      .limit(1);
    const second = first.sent
      ? await sendContributionReceipt(db, options)
      : { sent: false, reason: 'not_retried_after_failure' };
    const [afterSecond] = await db
      .select({ receiptEmailSentAt: attestations.receiptEmailSentAt })
      .from(attestations)
      .where(eq(attestations.code, code))
      .limit(1);
    const timestampAfterFirst = afterFirst?.receiptEmailSentAt?.toISOString() ?? null;
    const timestampAfterSecond = afterSecond?.receiptEmailSentAt?.toISOString() ?? null;
    console.log(JSON.stringify({
      first,
      second,
      receiptEmailSentAt: timestampAfterSecond,
      timestampStable: timestampAfterFirst === timestampAfterSecond,
    }));
    if (
      !first.sent ||
      second.sent ||
      second.reason !== 'already_sent_or_ineligible' ||
      !timestampAfterSecond ||
      timestampAfterFirst !== timestampAfterSecond
    ) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('RECEIPT_EMAIL_TEST_FAILED', error.name);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
