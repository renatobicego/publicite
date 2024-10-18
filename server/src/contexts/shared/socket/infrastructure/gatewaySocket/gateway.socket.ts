import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { SocketNotificationServiceInterface } from '../../domain/service/socket.notification.service.interface';
import { Inject } from '@nestjs/common';
import { GroupInvitation } from '../../domain/entity/group.invitation.notification';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGatewaySocket
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private clients: Record<string, { socket: Socket; userId: string }> = {};

  @Inject('SocketNotificationServiceInterface')
  private readonly notificatorService: SocketNotificationServiceInterface;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.clients[userId] = { socket: client, userId };
    }
    console.log('New client connected', client.id);
  }

  handleDisconnect(client: Socket) {
    const userId = Object.keys(this.clients).find(
      (key) => this.clients[key].socket.id === client.id,
    );
    if (userId) {
      delete this.clients[userId];
    }
    console.log('Client disconnected', client.id);
  }

  //Enviar solicitud de grupo a un usuario especifico
  @SubscribeMessage('notification_group_ivitation')
  notification_member_group_request(@MessageBody() data: GroupInvitation) {
    const { groupInvitation } = data;
    const { userToSendId } = groupInvitation.backData;
    const client = this.clients[userToSendId]?.socket;

    if (client) {
      client.emit(groupInvitation.event, groupInvitation);
      this.notificatorService.sendNotificationToUser(groupInvitation);
    } else {
      this.notificatorService.sendNotificationToUser(groupInvitation);
    }
  }
}
