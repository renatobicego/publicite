import Invoice from "../entity/invoice.entity";
import Subcription from "../entity/subcription.entity";


export default interface SubPreapprovalRepositoryInterface{
	saveSubPreapproval(sub: Subcription): Promise<void>;
	saveInvoice(invoice: Invoice): Promise<void>;
}
