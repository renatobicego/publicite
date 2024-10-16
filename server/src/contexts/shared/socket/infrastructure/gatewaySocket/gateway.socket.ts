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
  @SubscribeMessage('member_group_request')
  notification_member_group_request(
    @MessageBody()
    data: {
      toId: string;
      message: any;
      ids: Map<string, string>;
    },
  ) {
    const toJsonData = JSON.parse(data as any);
    const client = this.clients[toJsonData.data.toId]?.socket;

    if (client) {
      const messageHtml = `Nueva notif`;
      client.emit('member_group_request', messageHtml);
      this.notificatorService.sendNotificationToUser(toJsonData);
    } else {
      this.notificatorService.sendNotificationToUser(toJsonData);
    }
  }
}
