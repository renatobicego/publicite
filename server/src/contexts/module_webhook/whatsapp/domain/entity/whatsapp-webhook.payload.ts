/**
 * Tipado mínimo del payload que envía YCloud (proveedor/BSP de WhatsApp) al webhook.
 * Solo modelamos lo que consumimos; el evento real trae más campos.
 *
 * A diferencia de Meta (entry[] -> changes[] -> value), YCloud manda UN evento por POST
 * con la forma { id, type, ..., whatsappInboundMessage: {...} }.
 *
 * Doc: https://docs.ycloud.com/reference/whatsapp-inbound-message-webhook-examples
 */

// Mensaje entrante de un cliente (lo que vive en `whatsappInboundMessage`).
export interface YCloudInboundMessage {
  id: string; // id interno de YCloud (para deduplicar reintentos)
  wamid?: string; // id del mensaje en WhatsApp
  wabaId?: string;
  from: string; // teléfono del cliente en formato E.164 (con '+')
  to: string; // teléfono del negocio que recibió el mensaje (E.164, con '+')
  sendTime?: string;
  type: string; // 'text' | 'image' | 'audio' | 'location' | ...
  text?: {
    body: string;
  };
}

/**
 * Evento de webhook de YCloud. El campo `type` discrimina el evento; nos interesa
 * únicamente `whatsapp.inbound_message.received`. Los demás (status updates, plantillas,
 * cambios de cuenta, etc.) llegan por el mismo webhook y se ignoran.
 */
export interface WhatsAppWebhookPayload {
  id: string; // id del evento (ej. 'evt_...')
  type: string; // ej. 'whatsapp.inbound_message.received'
  apiVersion?: string;
  createTime?: string;
  whatsappInboundMessage?: YCloudInboundMessage;
}

// Tipo del evento que representa un mensaje entrante de un cliente.
export const YCLOUD_INBOUND_MESSAGE_EVENT = 'whatsapp.inbound_message.received';
