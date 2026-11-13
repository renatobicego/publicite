export interface FetchToMpInterface {
    getDataFromMp_fetch(url: string): Promise<any>
    changeSubscriptionStatusInMercadopago_fetch(url: string, preapproval_id: string, subscription_action: string): Promise<any>
    /** POST /preapproval. Lanza MercadoPagoApiError si MP no lo acepta. */
    createPreapproval(body: Record<string, any>): Promise<any>
    /** PUT /preapproval/{id} (tarjeta, estado, monto). Lanza MercadoPagoApiError si MP no lo acepta. */
    updatePreapproval(preapprovalId: string, body: Record<string, any>): Promise<any>
    /**
     * POST /v1/payments: pago único con el token del Brick de tarjeta. La clave de
     * idempotencia hace que un reintento no cobre dos veces. Lanza MercadoPagoApiError.
     */
    createPayment(body: Record<string, any>, idempotencyKey: string): Promise<any>
}
