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
import {
  allowedEvents,
  EventTypes,
  GroupInvitation,
} from '../../domain/entity/group.invitation.notification';
import { GroupNotificationEvents } from '../../domain/notification/group.notification.events';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGatewaySocket
  implements OnGatewayConnection, OnGatewayDisconnect, GroupNotificationEvents
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

  getInformationFromNotificationGroup(data: any): {
    groupInvitation: GroupInvitation;
    client: Socket;
  } {
    const { groupInvitation } = data;
    const { userToSendId } = groupInvitation.notification.backData;
    const { event } = groupInvitation.notification;
    const client = this.clients[userToSendId]?.socket;
    if (!allowedEvents.has(event as EventTypes)) {
      throw Error(`Invalid event type: ${event}`);
    }

    return {
      groupInvitation,
      client,
    };
  }

  handleNotification(
    groupInvitation: GroupInvitation,
    event: string,
    client: Socket,
  ) {
    if (client) {
      client.emit(event, groupInvitation);
      this.notificatorService.sendNotificationToUser(groupInvitation);
    } else {
      this.notificatorService.sendNotificationToUser(groupInvitation);
    }
  }

  @SubscribeMessage('group_notifications')
  group_notifications(@MessageBody() data: GroupInvitation) {
    try {
      const { groupInvitation, client } =
        this.getInformationFromNotificationGroup(data);

      this.handleNotification(groupInvitation, 'group_notifications', client);
    } catch (error: any) {
      throw error;
    }
  }
}
