import Stripe from 'stripe';
import { sanitizeName } from './name.js';
import {
  registrarContribuicao,
  registrarContribuicaoFatura,
} from '../lib/contributions.js';
import {
  linkAttestationToContributor,
  recordContributorPayment,
} from '../lib/contributor-ledger.js';
import { sendContributionReceipt } from '../lib/receipt-email.js';
import { db } from '../lib/db.js';

export const config = { api: { bodyParser: false } };

const eventTypes = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

function subscriptionIdFromInvoice(invoice) {
  return invoice.subscription ||
    invoice.parent?.subscription_details?.subscription ||
    null;
}

function invoiceQuantity(invoice, subscriptionId, fallback) {
  const line = invoiceSubscriptionLine(invoice, subscriptionId);
  return line?.quantity === null || line?.quantity === undefined
    ? Number(fallback)
    : Number(line.quantity);
}

function invoiceSubscriptionLine(invoice, subscriptionId) {
  const lines = invoice.lines?.data || [];
  return lines.find((line) =>
    line.subscription === subscriptionId ||
    line.parent?.subscription_item_details?.subscription === subscriptionId,
  );
}

async function accumulatePaidInvoice(stripe, invoice) {
  const invoiceId = invoice.id;
  const subscriptionId = subscriptionIdFromInvoice(invoice);
  if (!subscriptionId) {
    console.log('WEBHOOK_INVOICE_IGNORADA', JSON.stringify({
      invoice_id: invoiceId,
      motivo: 'subscription ausente',
    }));
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['customer'],
  });
  const metadata = subscription.metadata || {};
  if (metadata.origem && metadata.origem !== 'site') return;
  if (!metadata.emissao_kg) {
    console.log('WEBHOOK_INVOICE_IGNORADA', JSON.stringify({
      invoice_id: invoiceId,
      subscription_id: subscriptionId,
      motivo: 'metadata de compensacao ausente',
    }));
    return;
  }

  const kg = invoiceQuantity(invoice, subscriptionId, metadata.emissao_kg);
  if (!Number.isFinite(kg) || kg <= 0) {
    console.log('WEBHOOK_INVOICE_IGNORADA', JSON.stringify({
      invoice_id: invoiceId,
      subscription_id: subscriptionId,
      motivo: 'quantidade invalida',
    }));
    return;
  }

  const kgInteiro = Math.min(100000, Math.max(25, Math.round(kg)));
  const countryCode = String(metadata.pais || '').toUpperCase();
  const country = /^[A-Z]{2}$/.test(countryCode) ? countryCode : 'nao_informado';
  const name = sanitizeName(metadata.nome || invoice.customer_name);
  const customer = subscription.customer;
  const liveCustomer = customer && typeof customer === 'object' && !customer.deleted
    ? customer
    : null;
  const email = String(
    invoice.customer_email ||
    liveCustomer?.email ||
    '',
  ).trim().toLowerCase();
  const customerName = liveCustomer?.name;
  const invoiceLine = invoiceSubscriptionLine(invoice, subscriptionId);
  const coverageStart = metadata.categoria === 'anual' && invoiceLine?.period?.start
    ? new Date(invoiceLine.period.start * 1000)
    : undefined;
  const coverageEnd = metadata.categoria === 'anual' && invoiceLine?.period?.end
    ? new Date(invoiceLine.period.end * 1000)
    : undefined;
  const result = await recordContributorPayment(db, {
    stripeReference: invoiceId,
    kg: kgInteiro,
    country,
    planType: metadata.categoria === 'mensal' || metadata.categoria === 'anual'
      ? metadata.categoria
      : null,
    paymentType: 'invoice',
    occurredAt: new Date((invoice.status_transitions?.paid_at || invoice.created) * 1000),
    coverageStart,
    coverageEnd,
    email,
    name: name === 'Anonymous' ? sanitizeName(customerName) : name,
    consent: metadata.opt_out === 'false' && metadata.exibir_nome === 'true',
  });
  console.log(result.created ? 'WEBHOOK_INVOICE_RECORDED' : 'WEBHOOK_INVOICE_DUPLICATE', JSON.stringify({
    invoice_id: invoiceId,
    subscription_id: subscriptionId,
    kg: kgInteiro,
  }));

  const category = metadata.categoria;
  if (
    invoice.status === 'paid' &&
    invoice.billing_reason === 'subscription_cycle' &&
    (category === 'mensal' || category === 'anual')
  ) {
    const contribution = await registrarContribuicaoFatura({
      invoice,
      kg: kgInteiro,
    });
    if (contribution.code) {
      await sendReceiptForContribution(
        contribution,
        {
          email,
          name: name === 'Anonymous' ? sanitizeName(customerName) : name,
          category,
        },
        invoiceId,
        invoiceId,
      );
    }
  }
}

async function processCheckoutSession(stripe, session, eventId) {
  const currentSession = await stripe.checkout.sessions.retrieve(session.id);
  if (!['paid', 'no_payment_required'].includes(currentSession.payment_status)) return;

  const contribution = await registrarContribuicao({ session: currentSession });
  if (!contribution?.code) return;

  const metadata = currentSession.metadata || {};
  if (!metadata.origem || metadata.origem === 'site') {
    const consent = metadata.opt_out === 'false' && metadata.exibir_nome === 'true';
    const name = sanitizeName(metadata.nome || currentSession.customer_details?.name);
    const email = currentSession.customer_details?.email ||
      currentSession.customer_email || '';
    const countryCode = String(metadata.pais || '').toUpperCase();
    const country = /^[A-Z]{2}$/.test(countryCode) ? countryCode : 'nao_informado';
    if (currentSession.mode === 'payment') {
      await recordContributorPayment(db, {
        stripeReference: currentSession.id,
        kg: contribution.kg,
        country,
        planType: metadata.categoria || null,
        paymentType: 'checkout',
        occurredAt: new Date(currentSession.created * 1000),
        email,
        name,
        consent,
        attestationPaymentReference: currentSession.id,
      });
    } else {
      await linkAttestationToContributor(db, {
        paymentReference: currentSession.id,
        email,
        name,
        consent,
      });
    }
  }
  if (currentSession.payment_status === 'paid') {
    await sendReceiptForContribution(
      contribution,
      {
        email: currentSession.customer_details?.email || currentSession.customer_email,
        name: sanitizeName(
          currentSession.metadata?.nome || currentSession.customer_details?.name,
        ),
        category: currentSession.metadata?.categoria,
      },
      eventId,
      currentSession.id,
    );
  }
}

async function sendReceiptForContribution(contribution, details, eventId, paymentReference) {
  try {
    const name = details.name === 'Anonymous' ? '' : details.name;
    const category = details.category;
    const result = await sendContributionReceipt(db, {
      code: contribution.code,
      email: details.email,
      name,
      badge: category === 'anual'
        ? 'https://carbonpocket.app/carbonpocket-calculator/contributors/icons/annual-badge.png'
        : category === 'mensal'
          ? 'https://carbonpocket.app/carbonpocket-calculator/contributors/icons/monthly-badge.png'
          : '',
      plan: category === 'anual'
        ? 'Founders'
        : category === 'mensal'
          ? 'Starter Compensation'
          : 'One-time purchase',
    });
    if (!result.sent) {
      console.warn('RECEIPT_EMAIL_NOT_SENT', {
        event_id: eventId,
        payment_reference: paymentReference,
        code: contribution.code,
        reason: result.reason,
      });
    }
  } catch (error) {
    console.error('RECEIPT_EMAIL_FALHOU', {
      event_id: eventId,
      payment_reference: paymentReference,
      code: contribution.code,
      erro: error.name,
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') {
    // Sem assinatura não há payload confiável; responder 400 evita tratar isso como erro interno.
    return res.status(400).json({ erro: 'Invalid signature' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('CONFIGURACAO_WEBHOOK_AUSENTE');
    return res.status(500).json({ erro: 'Unable to verify event' });
  }

  let rawBody;
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    rawBody = Buffer.concat(chunks);
  } catch (error) {
    // Falhas inesperadas ao ler o stream são erros internos e devem ser registradas sem o conteúdo.
    console.error('ERRO_LEITURA_CORPO_WEBHOOK', error.name);
    return res.status(500).json({ erro: 'Unable to process event' });
  }

  try {
    // A análise aqui serve somente para rejeitar JSON malformado; o conteúdo não é usado antes da assinatura.
    JSON.parse(rawBody.toString('utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) {
      // JSON inválido é uma requisição malformada, não uma falha de assinatura nem erro interno.
      console.error('CORPO_WEBHOOK_MALFORMADO');
      return res.status(400).json({ erro: 'Invalid payload' });
    }
    console.error('ERRO_VALIDACAO_CORPO_WEBHOOK', error.name);
    return res.status(500).json({ erro: 'Unable to process event' });
  }

  let event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    if (error.type === 'StripeSignatureVerificationError') {
      // Assinatura inválida é rejeitada com 400 para não confundir o erro com falha do handler.
      console.error('ASSINATURA_WEBHOOK_INVALIDA');
      return res.status(400).json({ erro: 'Invalid signature' });
    }
    console.error('ERRO_VERIFICACAO_WEBHOOK', error.type || error.name);
    return res.status(500).json({ erro: 'Unable to process event' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const object = event.data?.object;
    const session = object?.object === 'checkout.session' ? object : null;
    const record = {
      tipo: event.type,
      event_id: event.id,
      livemode: event.livemode,
      created: event.created,
      ...(object?.id ? { object_id: object.id } : {}),
      ...(session
        ? {
            session: {
              id: session.id,
              payment_status: session.payment_status,
              mode: session.mode,
              amount_total: session.amount_total,
              currency: session.currency,
              nome: session.metadata?.nome
                ? sanitizeName(session.metadata.nome)
                : undefined,
              emissao_kg: session.metadata?.emissao_kg,
              categoria: session.metadata?.categoria,
              customer_email: session.customer_email || session.customer_details?.email
                ? 'presente'
                : 'ausente',
            },
          }
        : {}),
    };

    console.log('WEBHOOK_EVENT', JSON.stringify(record));

    // Eventos válidos não previstos são registrados e confirmados para evitar reenvios por até três dias.
    if (!eventTypes.has(event.type)) {
      return res.status(200).json({ received: true, ignored: true });
    }

    if (event.type === 'checkout.session.completed') {
      if (session?.payment_status === 'paid') {
        try {
          await processCheckoutSession(stripe, session, event.id);
        } catch (error) {
          console.error('WEBHOOK_DB_ERROR', {
            event_id: event.id,
            session_id: session.id,
            error: error.name,
          });
          throw error;
        }
      }
      return res.status(200).json({ received: true });
    }

    if (event.type === 'checkout.session.async_payment_succeeded') {
      if (session) {
        try {
          await processCheckoutSession(stripe, session, event.id);
        } catch (error) {
          console.error('WEBHOOK_DB_ERROR', {
            event_id: event.id,
            session_id: session.id,
            error: error.name,
          });
          throw error;
        }
      }
      return res.status(200).json({ received: true });
    }

    if (event.type === 'invoice.paid') {
      console.log('WEBHOOK_INVOICE_PAID', JSON.stringify({
        invoice_id: object?.id,
        subscription: subscriptionIdFromInvoice(object || {}),
        amount_paid: object?.amount_paid ?? null,
      }));
      // TODO: agregar renovações à rodada de compensação é uma decisão futura.
      await accumulatePaidInvoice(stripe, object);
      return res.status(200).json({ received: true });
    }

    if (event.type === 'invoice.payment_failed') {
      console.log('WEBHOOK_INVOICE_PAYMENT_FAILED', JSON.stringify({
        invoice_id: object?.id,
        subscription_id: subscriptionIdFromInvoice(object || {}),
      }));
      return res.status(200).json({ received: true });
    }

    // O fulfillment continua manual e agregado; este handler apenas registra eventos verificados.
    return res.status(200).json({ received: true });
  } catch (error) {
    // Erros inesperados são registrados sem incluir corpo, segredo ou endereço de e-mail.
    console.error('ERRO_PROCESSAMENTO_WEBHOOK', error.name);
    return res.status(500).json({ erro: 'Unable to process event' });
  }
}
