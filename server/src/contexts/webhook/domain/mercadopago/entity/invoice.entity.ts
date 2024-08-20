import { ObjectId } from "mongoose";

//subcription_authorized_payment
export default class Invoice {

	private paymentId: ObjectId | undefined;
	private subscriptionId: ObjectId | undefined;
	private status: string;
	//private mpAuthorizedPaymentId: string;
	private preapprovalId: string;

	constructor(paymentId: ObjectId | undefined, subscriptionId: ObjectId | undefined, status: string, preapprovalId: string) {
		this.paymentId = paymentId;
		this.subscriptionId = subscriptionId;
		this.status = status;
		this.preapprovalId = preapprovalId;
		//this.mpAuthorizedPaymentId = mpAuthorizedPaymentId;
	}



	getPaymentId(): ObjectId  | undefined {
		return this.paymentId
	}	

}