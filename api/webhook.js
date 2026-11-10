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

    // O fulfillment é manual e agregado; este handler apenas registra eventos verificados.
    return res.status(200).json({ received: true });
  } catch (error) {
    // Erros inesperados são registrados sem incluir corpo, segredo ou endereço de e-mail.
    console.error('ERRO_PROCESSAMENTO_WEBHOOK', error.name);
    return res.status(500).json({ erro: 'Unable to process event' });
  }
}
