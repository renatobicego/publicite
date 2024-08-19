//subcription_authorized_payment
export default class Invoice {

	private paymentId: string;
	private subscriptionId: string;
	private status: string;
	//private mpAuthorizedPaymentId: string;
	private preapprovalId: string;

	constructor(paymentId: string, subscriptionId: string, status: string, preapprovalId: string) {
		this.paymentId = paymentId;
		this.subscriptionId = subscriptionId;
		this.status = status;
		this.preapprovalId = preapprovalId;
		//this.mpAuthorizedPaymentId = mpAuthorizedPaymentId;
	}



	getPaymentId(): string {
		return this.paymentId
	}	

}