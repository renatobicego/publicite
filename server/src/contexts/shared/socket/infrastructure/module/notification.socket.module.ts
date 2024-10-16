import { Module } from '@nestjs/common';
import { NotificationGatewaySocket } from '../gatewaySocket/gateway.socket';
import { SocketNotificationService } from '../../application/service/socket.notification.service';

@Module({
  providers: [
    NotificationGatewaySocket,
    {
      provide: 'SocketNotificationServiceInterface',
      useClass: SocketNotificationService,
    },
  ],
})
export class NotificationSocketModule {}
