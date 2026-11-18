import { and, eq, isNull } from 'drizzle-orm';
import { attestations } from './schema.js';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function formatKg(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return '0';
  return number.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 254 && EMAIL_RE.test(email);
}

async function postBrevo({ to, toName, params }) {
  const apiKey = process.env.BREVO_API_KEY;
  const templateId = Number(process.env.BREVO_TEMPLATE_ID);
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail || !Number.isInteger(templateId) || templateId <= 0) {
    return { ok: false, retryable: false, code: 'brevo_not_configured' };
  }

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          email: senderEmail,
          name: process.env.BREVO_SENDER_NAME || 'Carbon Pocket',
        },
        to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        templateId,
        params,
        tags: ['contribution-receipt'],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) return { ok: true };
    const code = `http_${response.status}`;
    if (response.status >= 400 && response.status < 500) {
      return { ok: false, ambiguous: false, code };
    }
    return { ok: false, ambiguous: true, code };
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return {
      ok: false,
      retryable: true,
      ambiguous: true,
      code: timedOut ? 'timeout' : 'network',
    };
  }
}

export async function sendContributionReceipt(database, options) {
  const { code, email, name, badge, plan } = options || {};

  if (!code) return { sent: false, reason: 'missing_code' };
  if (!isValidEmail(email)) return { sent: false, reason: 'invalid_email' };

  const [claimed] = await database
    .update(attestations)
    .set({
      receiptEmailSentAt: new Date(),
      receiptEmailError: null,
    })
    .where(and(
      eq(attestations.code, code),
      isNull(attestations.receiptEmailSentAt),
      isNull(attestations.reversedAt),
    ))
    .returning({ kg: attestations.kg });

  if (!claimed) {
    return { sent: false, reason: 'already_sent_or_ineligible' };
  }

  const result = await postBrevo({
    to: email,
    toName: name || undefined,
    params: {
      nome: name || 'Contributor',
      badge_usuario: badge || '',
      // Brevo template #4 does not render this extra parameter today.
      plano: plan || 'Contribution',
      emissao_kg: formatKg(claimed.kg),
      email,
      codigo_registro: code,
    },
  });

  if (result.ok) return { sent: true };

  if (result.ambiguous) {
    await database
      .update(attestations)
      .set({ receiptEmailError: `ambiguous_${result.code}` })
      .where(eq(attestations.code, code));
    return { sent: false, reason: 'ambiguous_failure' };
  }

  await database
    .update(attestations)
    .set({
      receiptEmailSentAt: null,
      receiptEmailError: result.code,
    })
    .where(eq(attestations.code, code));
  return { sent: false, reason: result.code };
}
