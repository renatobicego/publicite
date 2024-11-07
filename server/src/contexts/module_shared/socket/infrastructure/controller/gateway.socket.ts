import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";


import { SocketAdapterInterface } from "../../application/adapter/socket.adapter.interface";
import { AuthSocket } from "../auth/socket.auth";

@Controller('socket')
export class SocketContrroller {
  constructor(
    @Inject('SocketAdapterInterface')
    private readonly socketAdapter: SocketAdapterInterface
  ) { }
  @Post()
  @UseGuards(AuthSocket)
  async socketController(
    @Body() notificationBody: any,
  ): Promise<any> {
    try {

      //await this.socketAdapter.handleEventNotification(notificationBody);
    } catch (error: any) {
      throw error;
    }
  }


}