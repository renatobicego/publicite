import { Body, Controller, Post } from "@nestjs/common";
import { UserPersonCreateRequest } from "./request/userPersonCreate.request";
import { UserBusinessCreateRequest } from "./request/userBusinessCreate.request";

@Controller('user')
export class UserController {
    constructor(
    ) { }


    @Post('/personal')
    async createPersonalUserController(
        @Body() requestUser: UserPersonCreateRequest,
    ): Promise<void> {

    }

    @Post('/business')
    async createBusinessUserController(
        @Body() requestUser: UserBusinessCreateRequest,
    ): Promise<void> {

    }



}
