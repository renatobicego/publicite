import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MyLoggerService } from "src/contexts/shared/logger/logger.service";
import Subcription from "src/contexts/webhook/domain/mercadopago/entity/subcription.entity";
import SubPreapprovalRepositoryInterface from "src/contexts/webhook/domain/mercadopago/repository/sub_preapproval.respository.interface";
import { SubscriptionDocument } from "../../schemas/mercadopago/subscription.schema";
import Invoice from "src/contexts/webhook/domain/mercadopago/entity/invoice.entity";
import { InvoiceDocument } from "../../schemas/mercadopago/invoice.schema";

export default class SubPreapprovalRepository implements SubPreapprovalRepositoryInterface {

	constructor(
		private readonly logger: MyLoggerService,
		@InjectModel('Subscription') private readonly subscriptionModel: Model<SubscriptionDocument>,
		@InjectModel('Invoice') private readonly invoiceModel: Model<InvoiceDocument>
	) { }


	async saveSubPreapproval(sub: Subcription): Promise<void> {
		this.logger.log("saving new subscription in database SUB_ID: " + sub.getMpPreapprovalId())
		const newSubscription = new this.subscriptionModel(sub)
		await newSubscription.save()
	}

	async saveInvoice(invoice: Invoice): Promise<void> {
		this.logger.log("saving new Invoice in database Invoice ID: " + invoice.getPaymentId())
		const newInvoice = new this.invoiceModel(invoice)
		await newInvoice.save()

	}

}