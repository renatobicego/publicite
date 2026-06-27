/**
 * Puerto de salida hacia YCloud (BSP de WhatsApp) para enviar mensajes.
 * El servicio depende de esta interfaz; la implementación concreta
 * (cliente HTTP a api.ycloud.com) vive en aplicación/infraestructura.
 */
export interface WhatsAppSenderInterface {
  /**
   * Envía un mensaje de texto por WhatsApp vía YCloud.
   * @param from teléfono del negocio (E.164 con '+'), el número conectado en YCloud
   * @param to teléfono del destinatario (E.164 con '+')
   * @param body texto a enviar (se trunca al límite de WhatsApp)
   */
  sendText(from: string, to: string, body: string): Promise<void>;
}

export const WHATSAPP_SENDER = 'WhatsAppSenderInterface';
