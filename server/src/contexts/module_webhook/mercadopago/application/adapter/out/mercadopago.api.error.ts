import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

/**
 * Error de una llamada a la API de MercadoPago que respondió con un estado no OK.
 * Guarda el estado HTTP y el cuerpo que devolvió MP (`message`, `cause[]`, ...)
 * para poder explicarle al usuario qué pasó sin exponer el detalle crudo.
 */
export class MercadoPagoApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: any,
  ) {
    super(
      `MercadoPago respondió ${status}: ${
        typeof body === 'string' ? body : JSON.stringify(body)
      }`,
    );
    this.name = 'MercadoPagoApiError';
  }

  /** Texto de MP en minúsculas (message + causas), para clasificar el rechazo. */
  get detail(): string {
    const parts: string[] = [];
    if (this.body?.message) parts.push(String(this.body.message));
    if (this.body?.error) parts.push(String(this.body.error));
    for (const cause of this.body?.cause ?? []) {
      if (cause?.description) parts.push(String(cause.description));
      if (cause?.code) parts.push(String(cause.code));
    }
    return parts.join(' ').toLowerCase();
  }
}

/**
 * Traduce un rechazo de MP (alta de suscripción, pago único, cambio de tarjeta) a
 * un mensaje que el usuario entienda. Otros errores se devuelven tal cual.
 */
export function mercadoPagoUserError(error: any): Error {
  if (!(error instanceof MercadoPagoApiError)) return error;
  const detail = error.detail;
  if (error.status >= 500) {
    return new ServiceUnavailableException(
      'MercadoPago no está respondiendo. Probá de nuevo en unos minutos.',
    );
  }
  if (/reject|rechaz|insufficient|high_risk|blacklist|cc_/.test(detail)) {
    return new BadRequestException(
      'La tarjeta fue rechazada. Probá con otra tarjeta o consultá con tu banco.',
    );
  }
  if (/token/.test(detail)) {
    return new BadRequestException(
      'No pudimos validar la tarjeta. Volvé a cargar los datos e intentá de nuevo.',
    );
  }
  if (/payer|email/.test(detail)) {
    return new BadRequestException('Revisá el email del pagador e intentá de nuevo.');
  }
  return new BadRequestException(
    'No pudimos procesar el pago. Revisá los datos de la tarjeta e intentá de nuevo.',
  );
}

/** Mensaje para un pago único que MP respondió rechazado (status 200 con status rejected). */
export function rejectedPaymentMessage(statusDetail?: string | null): string {
  const detail = (statusDetail ?? '').toLowerCase();
  if (detail.includes('insufficient')) return 'La tarjeta no tiene fondos suficientes.';
  if (detail.includes('high_risk')) {
    return 'MercadoPago rechazó el pago por seguridad. Probá con otra tarjeta o más tarde.';
  }
  if (detail.includes('bad_filled') || detail.includes('security_code')) {
    return 'Revisá los datos de la tarjeta (número, vencimiento y código de seguridad).';
  }
  return 'La tarjeta fue rechazada. Probá con otra tarjeta o consultá con tu banco.';
}
