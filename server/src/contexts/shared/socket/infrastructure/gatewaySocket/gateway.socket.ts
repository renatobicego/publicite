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
import { Inject, UseGuards } from '@nestjs/common';
import {
  allowedEvents,
  EventTypes,
  GroupInvitation,
} from '../../domain/entity/group.invitation.notification';
import { GroupNotificationEvents } from '../../domain/notification/group.notification.events';
import { ClerkAuthGuard } from 'src/contexts/shared/auth/clerk-auth/clerk.auth.guard';

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
  }

  handleDisconnect(client: Socket) {
    const userId = Object.keys(this.clients).find(
      (key) => this.clients[key].socket.id === client.id,
    );
    if (userId) {
      delete this.clients[userId];
    }
  }

  getInformationFromNotification(data: any): {
    notificationBody: any;
    client: Socket;
  } {
    const { notificationBody } = data;
    const { userToSendId } = notificationBody.notification.backData;
    const { event } = notificationBody.notification;
    const client = this.clients[userToSendId]?.socket;
    if (!allowedEvents.has(event as EventTypes)) {
      throw Error(`Invalid event type: ${event}`);
    }

    return {
      notificationBody,
      client,
    };
  }

  handleNotification(notificationBody: any, event: string, client: Socket) {
    if (client) {
      client.emit(event, notificationBody);
      this.notificatorService.handleEventNotification(notificationBody);
    } else {
      this.notificatorService.handleEventNotification(notificationBody);
    }
  }

  @SubscribeMessage('group_notifications')
  @UseGuards(ClerkAuthGuard)
  group_notifications(@MessageBody() data: GroupInvitation) {
    try {
      const { notificationBody, client } =
        this.getInformationFromNotification(data);

      this.handleNotification(notificationBody, 'group_notifications', client);
    } catch (error: any) {
      throw error;
    }
  }
}
