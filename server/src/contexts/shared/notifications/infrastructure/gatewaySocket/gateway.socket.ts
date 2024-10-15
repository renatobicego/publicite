import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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

  @SubscribeMessage('mensaje')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    console.log(data);
    this.server.emit('mensaje', data);
    // console.log(client.id);
    // client.broadcast.emit('mensaje', data);
  }

  @SubscribeMessage('member_group_request')
  notification_member_group_request(
    @MessageBody() data: { userId: string; event: string; message: any },
  ) {
    const toJsonData = JSON.parse(data as any);
    console.log(toJsonData.data.userId);
    const client = this.clients[toJsonData.data.userId]?.socket;

    if (client) {
      client.emit(toJsonData.event, toJsonData.data.message);
    }
  }
}
