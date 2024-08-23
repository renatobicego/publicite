import { UserAdapterInterface } from "../../application/interface/userAdapter.interface";
import { UserBusinessCreateRequest } from "../controller/request/userBusinessCreate.request";
import { UserPersonCreateRequest } from "../controller/request/userPersonCreate.request";

export class UserAdapter implements UserAdapterInterface{
    constructor(){
    }
    createBusinessUser(requestCreateBusinessUser: UserBusinessCreateRequest): Promise<void> {
        throw new Error("Method not implemented.");
    }
    createPersonUser(requestCreatePersonUser: UserPersonCreateRequest): Promise<void> {
        throw new Error("Method not implemented.");
    }


}