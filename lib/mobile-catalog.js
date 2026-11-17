// Catálogo autoritativo: os kg nunca vêm do payload do cliente.
export const MOBILE_CATALOG = Object.freeze({
  'carbonpocket.offset.subscription.monthly.250kg': { kg: 250, kind: 'subscription' },
  'carbonpocket.offset.subscription.monthly.500kg': { kg: 500, kind: 'subscription' },
  'carbonpocket.offset.subscription.monthly.750kg': { kg: 750, kind: 'subscription' },
  'carbonpocket.offset.subscription.monthly.1t': { kg: 1000, kind: 'subscription' },
  'carbonpocket.offset.subscription.annual.250kg': { kg: 3000, kind: 'subscription' },
  'carbonpocket.offset.subscription.annual.6t': { kg: 6000, kind: 'subscription' },
  'carbonpocket.offset.subscription.annual.9t': { kg: 9000, kind: 'subscription' },
  'carbonpocket.offset.subscription.annual.12t': { kg: 12000, kind: 'subscription' },
  'carbonpocket.offset.subscription.annual.6000kg': { kg: 6000, kind: 'subscription', legacy: true },
  'carbonpocket.offset.once.100kg': { kg: 100, kind: 'one_time' },
  'carbonpocket.offset.once.250kg': { kg: 250, kind: 'one_time' },
  'carbonpocket.offset.once.500kg': { kg: 500, kind: 'one_time' },
  'carbonpocket.offset.once.750kg2': { kg: 750, kind: 'one_time' },
  'carbonpocket.offset.once.1000kg': { kg: 1000, kind: 'one_time' },
  'carbonpocket.offset.gift.500kg': { kg: 500, kind: 'one_time' },
});

// annual.250kg representa 250 kg/mês cobrados anualmente: 3.000 kg por evento.
// Assinaturas anuais recebem o volume integral em cada renovação.
// gift.500kg é legado e fica atribuído ao comprador; não há destinatário no schema.
