

export interface MpPaymentServiceInterface {
  createPayment(payment: any): Promise<void>;
  findPaymentByPaymentID(id: string): Promise<any>;
  getPaymentByMongoId(id: string): Promise<any>;
  updatePayment(payment: any): Promise<void>;
  findApprovedPaymentByReference(
    external_reference: string,
    preapprovalId: string,
    transactionAmount: number,
  ): Promise<any>;
}
