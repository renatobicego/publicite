import Invoice from "../entity/invoice.entity";
import Subcription from "../entity/subcription.entity";


export default interface MercadoPagoEventsRepositoryInterface {
	saveSubPreapproval(sub: Subcription): Promise<void>;
	saveInvoice(invoice: Invoice): Promise<void>;
	updateUserSubscription(payerId: string, sub: Subcription): Promise<void>;
	findByPayerId(payerId: string): Promise<Subcription | null>;
}
