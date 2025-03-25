import { Controller, Delete, Inject, Param, UseGuards } from "@nestjs/common";
import { GroupAdapterInterface } from "../../application/adapter/group.adapter.interface";
import { AuthSocket } from "src/contexts/module_socket/infrastructure/auth/socket.auth";

@Controller("group")
export class GroupController {

    constructor(
        @Inject('GroupAdapterInterface')
        private readonly groupAdapter: GroupAdapterInterface,
    ) { }


    @Delete(':id')
    @UseGuards(AuthSocket)
    async deleteAccount(@Param('id') id: string): Promise<any> {
        try {
            await this.groupAdapter.deleteAccount(id);

        } catch (error: any) {
            throw error;
        }
    }


}