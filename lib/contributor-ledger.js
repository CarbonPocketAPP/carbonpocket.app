import { createHmac } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { attestations, contributorPayments, contributorProfiles } from './schema.js';
import { sanitizeName } from '../api/name.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function publicIdentity({ email, name, consent }) {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const displayName = sanitizeName(name);
  if (
    consent !== true ||
    !EMAIL_RE.test(normalizedEmail) ||
    displayName === 'Anonymous' ||
    displayName.includes('@')
  ) {
    return null;
  }
  const secret = process.env.CONTRIBUTOR_IDENTITY_SECRET;
  if (typeof secret !== 'string' || Buffer.byteLength(secret) < 32) {
    throw new Error('CONTRIBUTOR_IDENTITY_SECRET must contain at least 32 bytes.');
  }

  const identityHash = createHmac('sha256', secret)
    .update(`${normalizedEmail}\u0000${displayName.normalize('NFKC').toLowerCase()}`)
    .digest('hex');
  return { identityHash, displayName };
}

async function ensureProfile(database, identity) {
  if (!identity) return null;
  const [profile] = await database
    .insert(contributorProfiles)
    .values({
      identityHash: identity.identityHash,
      displayName: identity.displayName,
      consentToPublish: true,
    })
    .onConflictDoUpdate({
      target: contributorProfiles.identityHash,
      set: {
        displayName: identity.displayName,
        consentToPublish: true,
        updatedAt: new Date(),
      },
    })
    .returning({ id: contributorProfiles.id });
  return profile?.id || null;
}

export async function linkAttestationToContributor(database, {
  paymentReference,
  email,
  name,
  consent,
}) {
  if (typeof paymentReference !== 'string' || paymentReference.length === 0) {
    throw new TypeError('Stripe Checkout session id is required to link an attestation.');
  }
  const identity = publicIdentity({ email, name, consent });
  if (!identity) return null;

  return database.transaction(async (transaction) => {
    const [attestation] = await transaction
      .select({
        id: attestations.id,
        contributorId: attestations.contributorId,
      })
      .from(attestations)
      .where(eq(attestations.paymentReference, paymentReference))
      .limit(1);
    if (!attestation) return null;
    if (attestation.contributorId) return attestation.contributorId;

    const contributorId = await ensureProfile(transaction, identity);
    if (!contributorId) return null;

    await transaction
      .update(attestations)
      .set({ contributorId })
      .where(and(
        eq(attestations.id, attestation.id),
        isNull(attestations.contributorId),
      ));
    return contributorId;
  });
}

export async function recordContributorPayment(database, {
  stripeReference,
  kg,
  country,
  planType,
  paymentType,
  occurredAt,
  coverageStart,
  coverageEnd,
  email,
  name,
  consent,
  attestationPaymentReference,
}) {
  if (
    typeof stripeReference !== 'string' ||
    stripeReference.length === 0 ||
    !Number.isInteger(kg) ||
    kg <= 0 ||
    !(occurredAt instanceof Date) ||
    !Number.isFinite(occurredAt.getTime()) ||
    (coverageStart && (!(coverageStart instanceof Date) || !Number.isFinite(coverageStart.getTime()))) ||
    (coverageEnd && (!(coverageEnd instanceof Date) || !Number.isFinite(coverageEnd.getTime()))) ||
    (coverageStart && coverageEnd && coverageEnd <= coverageStart) ||
    !['checkout', 'invoice'].includes(paymentType)
  ) {
    throw new TypeError('Invalid contributor payment record.');
  }
  const identity = publicIdentity({ email, name, consent });
  return database.transaction(async (transaction) => {
    const [payment] = await transaction
      .insert(contributorPayments)
      .values({
        stripeReference,
        kg,
        country,
        planType,
        paymentType,
        occurredAt,
        coverageStart,
        coverageEnd,
      })
      .onConflictDoNothing({
        target: contributorPayments.stripeReference,
      })
      .returning({ id: contributorPayments.id });
    if (!payment) return { created: false };

    const contributorId = await ensureProfile(transaction, identity);
    if (contributorId) {
      await transaction
        .update(contributorPayments)
        .set({ contributorId })
        .where(eq(contributorPayments.id, payment.id));
      if (attestationPaymentReference) {
        await transaction
          .update(attestations)
          .set({ contributorId })
          .where(and(
            eq(attestations.paymentReference, attestationPaymentReference),
            isNull(attestations.contributorId),
          ));
      }
    }

    return { created: true, contributorId };
  });
}
