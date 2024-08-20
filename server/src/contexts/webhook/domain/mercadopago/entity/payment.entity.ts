import { ObjectId } from "mongoose";

export default class Payment {
	private mpPaymentId: string;
	private payerId: string;
	private payerEmail: string;
	private paymentTypeId: string;
	private paymentMethodId: string;
	private transactionAmount: number;
	private dateApproved: string;
	private _id?: ObjectId;


	constructor(mpPaymentId: string, payerId: string, payerEmail: string, paymentTypeId: string, paymentMethodId: string, transactionAmount: number, dateApproved: string, _id?: ObjectId) {
		this.mpPaymentId = mpPaymentId;
		this.payerId = payerId;
		this.payerEmail = payerEmail;
		this.paymentTypeId = paymentTypeId;
		this.paymentMethodId = paymentMethodId;
		this.transactionAmount = transactionAmount;
		this.dateApproved = dateApproved;
		this._id = _id;
	}

	public getMPPaymentId(): string {
		return this.mpPaymentId;
	}

	public getId(): ObjectId | undefined {
		return this._id || undefined;
	}


	static fromDocument(doc: any): Payment {
		return new Payment(
			doc.mpPaymentId,
			doc.payerId,
			doc.payerEmail,
			doc.paymentTypeId,
			doc.paymentMethodId,
			doc.transactionAmount,
			doc.dateApproved,
			doc._id
		)
	}
} 