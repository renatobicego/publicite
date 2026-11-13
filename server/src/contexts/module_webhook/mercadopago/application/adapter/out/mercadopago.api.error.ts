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
