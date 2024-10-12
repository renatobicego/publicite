export interface MpPaymentAdapterInterface {
  getPaymentByClerkId(external_reference: string): Promise<any>;
}
