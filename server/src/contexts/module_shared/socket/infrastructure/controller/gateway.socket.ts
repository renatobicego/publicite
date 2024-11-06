import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { SocketAdapterInterface } from "../../application/adapter/socket.adapter.interface";
import { ClerkAuthGuard } from "src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard";

@Controller('socket')
export class SocketContrroller {
  constructor(
    @Inject('SocketAdapterInterface')
    private readonly socketAdapter: SocketAdapterInterface
  ) { }
  @Post()
  @UseGuards(ClerkAuthGuard)
  async socketController(
    @Body() notificationBody: any,
  ): Promise<any> {
    try {

      await this.socketAdapter.handleEventNotification(notificationBody);
    } catch (error: any) {
      throw error;
    }
  }


}