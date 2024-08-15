export default class Invoice {

	private paymentId: string;
	private subscriptionId: string;
	private status: string;
	private mpAuthorizedPaymentId: string;

	constructor(paymentId: string, subscriptionId: string, status: string, mpAuthorizedPaymentId: string) {
		this.paymentId = paymentId;
		this.subscriptionId = subscriptionId;
		this.status = status;
		this.mpAuthorizedPaymentId = mpAuthorizedPaymentId;
	}


}