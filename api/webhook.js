import Stripe from 'stripe';
import { sanitizeName } from './name.js';

export const config = { api: { bodyParser: false } };

const eventTypes = new Set([
  'checkout.session.completed',
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
  const lines = invoice.lines?.data || [];
  const matchingLine = lines.find((line) =>
    line.subscription === subscriptionId ||
    line.parent?.subscription_item_details?.subscription === subscriptionId,
  );
  const line = matchingLine || lines.find((item) => item.quantity !== null);
  const quantity = line?.quantity;
  return quantity === null || quantity === undefined ? Number(fallback) : Number(quantity);
}

function parseYearMap(rawValue, field, subscriptionId) {
  if (!rawValue) return {};
  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new TypeError('Invalid year map');
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(([year, value]) =>
        /^\d{4}$/.test(year) && Number.isFinite(Number(value)) && Number(value) >= 0,
      ),
    );
  } catch (error) {
    console.warn('WEBHOOK_METADATA_ANUAL_INVALIDO', field, subscriptionId, error.name);
    return {};
  }
}

function serializeYearMap(yearMap, field, subscriptionId) {
  const years = Object.keys(yearMap).sort();
  let serialized = JSON.stringify(yearMap);
  while (serialized.length >= 400 && years.length > 1) {
    const oldestYear = years.shift();
    delete yearMap[oldestYear];
    serialized = JSON.stringify(yearMap);
    console.warn('WEBHOOK_METADATA_ANUAL_TRUNCADO', field, subscriptionId, oldestYear);
  }
  if (serialized.length >= 400) {
    console.warn('WEBHOOK_METADATA_ANUAL_MUITO_LONGO', field, subscriptionId);
  }
  return serialized;
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

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const metadata = subscription.metadata || {};
  if (metadata.ultima_invoice_id === invoiceId) {
    console.log('WEBHOOK_INVOICE_DUPLICATE', JSON.stringify({
      invoice_id: invoiceId,
      subscription_id: subscriptionId,
    }));
    return;
  }

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

  const ano = new Date(invoice.created * 1000).getFullYear();
  if (!Number.isFinite(ano)) {
    console.log('WEBHOOK_INVOICE_IGNORADA', JSON.stringify({
      invoice_id: invoiceId,
      subscription_id: subscriptionId,
      motivo: 'ano invalido',
    }));
    return;
  }

  const kgPorAno = parseYearMap(metadata.kg_por_ano, 'kg_por_ano', subscriptionId);
  const faturasPorAno = parseYearMap(
    metadata.faturas_por_ano,
    'faturas_por_ano',
    subscriptionId,
  );
  const totalAno = Number(kgPorAno[ano] || 0) + kg;
  kgPorAno[ano] = totalAno;
  faturasPorAno[ano] = Number(faturasPorAno[ano] || 0) + 1;

  // ultima_invoice_id evita recontar a última entrega consecutiva; reenvios fora de ordem permanecem uma limitação aceita.
  await stripe.subscriptions.update(subscriptionId, {
    metadata: {
      ...metadata,
      kg_por_ano: serializeYearMap(kgPorAno, 'kg_por_ano', subscriptionId),
      faturas_por_ano: serializeYearMap(faturasPorAno, 'faturas_por_ano', subscriptionId),
      ultima_invoice_id: invoiceId,
    },
  });

  console.log('WEBHOOK_INVOICE', JSON.stringify({
    invoice_id: invoiceId,
    subscription_id: subscriptionId,
    kg,
    ano,
    total_ano: totalAno,
  }));
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

    if (event.type === 'invoice.paid') {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
