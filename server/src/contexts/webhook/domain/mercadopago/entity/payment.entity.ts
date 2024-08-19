export default class Payment {
	private mpPaymentId: string;
	private payerId: string;
	private payerEmail: string;
	private paymentTypeId: string;
	private paymentMethodId: string;
	private transactionAmount: number;
	private dateApproved: string;


	constructor(mpPaymentId: string, payerId: string, payerEmail: string, paymentTypeId: string, paymentMethodId: string, transactionAmount: number, dateApproved: string) {
		this.mpPaymentId = mpPaymentId;
		this.payerId = payerId;
		this.payerEmail = payerEmail;
		this.paymentTypeId = paymentTypeId;
		this.paymentMethodId = paymentMethodId;
		this.transactionAmount = transactionAmount;
		this.dateApproved = dateApproved;
	}

	public getMPPaymentId(): string {
		return this.mpPaymentId;
	}
} 