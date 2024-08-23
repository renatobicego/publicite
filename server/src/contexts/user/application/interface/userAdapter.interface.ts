import { UserBusinessCreateRequest } from "../../infraestructure/controller/request/userBusinessCreate.request";
import { UserPersonCreateRequest } from "../../infraestructure/controller/request/userPersonCreate.request";

export interface UserAdapterInterface{
    createPersonUser(requestCreatePersonUser : UserPersonCreateRequest) : Promise<void>;
    createBusinessUser(requestCreateBusinessUser: UserBusinessCreateRequest):Promise<void>;
}