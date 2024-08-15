import Subcription from "../entity/subcription.entity";


export default interface SubPreapprovalRepositoryInterface{
	saveSubPreapproval(sub: Subcription): Promise<void>;
}
