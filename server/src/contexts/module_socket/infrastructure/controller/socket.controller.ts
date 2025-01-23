import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";


import { SocketAdapterInterface } from "../../application/adapter/socket.adapter.interface";
import { AuthSocket } from "../auth/socket.auth";

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
      await this.socketAdapter.sendGroupNotificationToNotificationService(notificationBody);
      return { status: 'ok' };
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
      await this.socketAdapter.sendMagazineNotificationToNotificationService(notificationBody);
      return { status: 'ok' };
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
      await this.socketAdapter.sendUserNotificationToNotificationService(notificationBody);
      return { status: 'ok' };
    } catch (error: any) {
      throw error;
    }
  }
  @Post('post')
  @UseGuards(AuthSocket)
  async socketPostController(
    @Body() notificationBody: any,
  ): Promise<any> {
    try {
      const asd = await this.socketAdapter.sendPostNotificationToNotificationService(notificationBody);
      console.log(asd)
      return asd;
    } catch (error: any) {
      throw error;
    }
  }

  @Post('subscription')
  @UseGuards(AuthSocket)
  async socketSubscriptionController(
    @Body() notificationBody: any,
  ): Promise<any> {
    try {
      return await this.socketAdapter.sendSubscriptionNotificationToNotificationService(notificationBody);
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