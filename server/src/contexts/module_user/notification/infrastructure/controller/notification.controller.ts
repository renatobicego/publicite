import { Controller, Delete, Inject, Param, UseGuards } from "@nestjs/common";

import { NotificationAdapterInterface } from "../../domain/adapter/notification.adapter.interface";
import { AuthSocket } from "src/contexts/module_socket/infrastructure/auth/socket.auth";

@Controller("notification")
export class NotificationController {

    constructor(
        @Inject('NotificationAdapterInterface')
        private readonly notificationAdapter: NotificationAdapterInterface,
    ) { }


    @Delete(':id')
    @UseGuards(AuthSocket)
    async deleteAccount(@Param('id') id: string): Promise<any> {
        try {
            await this.notificationAdapter.deleteAccount(id);
        } catch (error: any) {
            throw error;
        }
    }


}