// import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";


// import { SocketAdapterInterface } from "../../application/adapter/socket.adapter.interface";
// import { AuthSocket } from "../auth/socket.auth";

// @Controller('socket')
// export class SocketController {
//   constructor(
//     @Inject('SocketAdapterInterface')
//     private readonly socketAdapter: SocketAdapterInterface
//   ) { }
//   @Post()
//   @UseGuards(AuthSocket)
//   async socketController(
//     @Body() notificationBody: any,
//   ): Promise<any> {
//     try {
//       await this.socketAdapter.handleEventNotification(notificationBody);
//     } catch (error: any) {
//       throw error;
//     }
//   }


// }

import { Controller, Inject, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SocketAdapterInterface } from '../../application/adapter/socket.adapter.interface';
import { AuthSocket } from '../auth/socket.auth';


// interface NotificationRequest {
//   notificationBody: {
//     notification: {
//       event: string;
//       viewed: boolean;
//       date: string;
//       backData: {
//         userIdTo: string;
//         userIdFrom: string;
//       };
//     };
//     frontData: {
//       group: {
//         _id: string;
//         name: string;
//         profilePhotoUrl: string;
//       };
//       userInviting: {
//         username: string;
//       };
//     };
//   };
// }

interface NotificationResponse {
  success: boolean;
}

@Controller()
@UseGuards(AuthSocket)
export class NotificationController {
  constructor(
    @Inject('SocketAdapterInterface')
    private readonly socketAdapter: SocketAdapterInterface
  ) { }

  @GrpcMethod('NotificationService', 'SendGroupNotification')
  async SendGroupNotification(data: any): Promise<NotificationResponse> {
    try {
      // Procesa el dato y llama al adaptador de socket
      await this.socketAdapter.handleEventNotification(data);
      console.log('Notification received:', data);
      return { success: true };
    } catch (error) {
      console.error('Error processing notification:', error);
      return { success: false };
    }
  }
}

