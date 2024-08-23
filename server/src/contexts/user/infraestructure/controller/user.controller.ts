import { Body, Controller, Inject, Post } from "@nestjs/common";
import { UserPersonCreateRequest } from "./request/userPersonCreate.request";
import { UserBusinessCreateRequest } from "./request/userBusinessCreate.request";
import { UserAdapterInterface } from "../../application/interface/userAdapter.interface";

@Controller('user')
export class UserController {
    constructor(
        @Inject('UserAdapterInterface') private readonly userAdapter: UserAdapterInterface,
    ) { }


    /*
    Deberia ver como arrojar distintos codigos de error, posiblemente capa de servicio se encarga. 

    */

    @Post('/personal')
    async createPersonalUserController(
        @Body() requesNewtUser: UserPersonCreateRequest,
    ): Promise<void> {
        try {
            await this.userAdapter.createPersonUser(requesNewtUser)
        } catch (error: any) {
            throw error;
        }
    }

    @Post('/business')
    async createBusinessUserController(
        @Body() requestNewUser: UserBusinessCreateRequest,
    ): Promise<void> {
        try {
            await this.userAdapter.createBusinessUser(requestNewUser)
        } catch (error: any) {
            throw error;
        }
    }



}
