/**
 * Puerto de salida hacia la WhatsApp Cloud API (Meta).
 * El dominio/servicio depende de esta interfaz; la implementación concreta
 * (cliente HTTP a la Graph API) vive en infraestructura/aplicación.
 */
export interface WhatsAppSenderInterface {
  /**
   * Envía un mensaje de texto a un número de WhatsApp.
   * @param to wa_id del destinatario (teléfono internacional sin '+')
   * @param body texto a enviar (se trunca al límite de WhatsApp)
   */
  sendText(to: string, body: string): Promise<void>;
}

export const WHATSAPP_SENDER = 'WhatsAppSenderInterface';
