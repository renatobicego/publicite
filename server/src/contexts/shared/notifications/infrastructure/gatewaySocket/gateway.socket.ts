import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ namespace: 'notification_contact_request' })
export class NotificationGatewaySocket {
  @WebSocketServer()
  server: any;

  @SubscribeMessage('contact_request')
  handleNotification(@MessageBody() contact_request: any): void {
    this.server.emit('contact_request', contact_request);
  }
}
