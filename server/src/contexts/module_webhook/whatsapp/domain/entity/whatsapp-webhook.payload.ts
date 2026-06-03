/**
 * Tipado mínimo del payload que envía la WhatsApp Cloud API (Meta) al webhook.
 * Solo modelamos lo que consumimos; el payload real trae muchos más campos.
 *
 * Estructura: entry[] -> changes[] -> value -> { messages[], statuses[], contacts[] }
 * Doc: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
 */

export interface WhatsAppTextMessage {
  from: string; // wa_id (teléfono del usuario en formato internacional, sin +)
  id: string; // id único del mensaje (para deduplicar reintentos)
  timestamp: string;
  type: string; // 'text' | 'image' | 'audio' | 'location' | ...
  text?: {
    body: string;
  };
}

export interface WhatsAppChangeValue {
  messaging_product: string;
  metadata?: {
    display_phone_number?: string;
    phone_number_id?: string;
  };
  contacts?: Array<{
    profile?: { name?: string };
    wa_id?: string;
  }>;
  messages?: WhatsAppTextMessage[];
  // Eventos de estado (entregado/leído). Llegan por el mismo webhook y se ignoran.
  statuses?: Array<Record<string, unknown>>;
}

export interface WhatsAppChange {
  field: string; // 'messages'
  value: WhatsAppChangeValue;
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppWebhookPayload {
  object: string; // 'whatsapp_business_account'
  entry: WhatsAppEntry[];
}
