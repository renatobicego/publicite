import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";


import { SocketAdapterInterface } from "../../application/adapter/socket.adapter.interface";
import { AuthSocket } from "../auth/socket.auth";
import { PreviousIdMissingException } from "src/contexts/module_shared/exceptionFilter/previousIdMissingException";

@Controller('socket')
export class SocketController {
  constructor(
    @Inject('SocketAdapterInterface')
    private readonly socketAdapter: SocketAdapterInterface
  ) { }
  @Post('group')
  @UseGuards(AuthSocket)
  async socketGroupController(
    @Body() notificationBody: any,
  ): Promise<any> {
    try {
      return await this.socketAdapter.sendGroupNotificationToNotificationService(notificationBody);
    } catch (error: any) {
      throw error;
    }
  }

  @Post('magazine')
  @UseGuards(AuthSocket)
  async socketMagazineController(
    @Body() notificationBody: any,
  ): Promise<any> {
    try {
      return await this.socketAdapter.sendMagazineNotificationToNotificationService(notificationBody);
    } catch (error: any) {
      throw error;
    }
  }


  @Post('user')
  @UseGuards(AuthSocket)
  async socketUserController(
    @Body() notificationBody: any,
  ): Promise<any> {
    try {
      return await this.socketAdapter.sendUserNotificationToNotificationService(notificationBody);
    } catch (error: any) {
      throw error;
    }
  }


}






// GPRC CONFIG ----->


// interface NotificationResponse {
//   success: boolean;
// }

// @Controller()
// @UseGuards(AuthSocket)
// export class NotificationController {
//   constructor(
//     @Inject('SocketAdapterInterface')
//     private readonly socketAdapter: SocketAdapterInterface
//   ) { }

//   @GrpcMethod('NotificationService', 'SendGroupNotification')
//   async SendGroupNotification(data: any): Promise<NotificationResponse> {
//     try {
//       // Procesa el dato y llama al adaptador de socket
//       await this.socketAdapter.handleEventNotification(data);
//       console.log('Notification received:', data);
//       return { success: true };
//     } catch (error) {
//       console.error('Error processing notification:', error);
//       return { success: false };
//     }
//   }
// }
// GPRC CONFIG ----->