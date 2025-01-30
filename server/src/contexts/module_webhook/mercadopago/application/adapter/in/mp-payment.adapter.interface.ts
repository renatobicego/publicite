export interface MpPaymentAdapterInterface {
  getPaymentByMongoId(external_reference: string): Promise<any>;
}
