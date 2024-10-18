import { Module } from '@nestjs/common';
import { NotificationGatewaySocket } from '../gatewaySocket/gateway.socket';
import { SocketNotificationService } from '../../application/service/socket.notification.service';
import { UserModule } from 'src/contexts/user/infrastructure/module/user.module';

@Module({
  imports: [UserModule],
  providers: [
    NotificationGatewaySocket,
    {
      provide: 'SocketNotificationServiceInterface',
      useClass: SocketNotificationService,
    },
  ],
})
export class NotificationSocketModule {}
