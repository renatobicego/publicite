import { Body, Controller, Inject, Post } from "@nestjs/common";
import { SocketAdapterInterface } from "../../application/adapter/socket.adapter.interface";

@Controller('socket')
export class SocketContrroller {
  constructor(
    @Inject('SocketAdapterInterface')
    private readonly socketAdapter: SocketAdapterInterface
  ) { }
  @Post()
  async helloTest(
    @Body() notificationBody: any,
  ): Promise<any> {
    try {
      await this.socketAdapter.handleEventNotification(notificationBody);
    } catch (error: any) {
      throw error;
    }
  }


}