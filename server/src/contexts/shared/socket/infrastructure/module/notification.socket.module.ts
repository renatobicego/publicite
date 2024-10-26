import { Module } from '@nestjs/common';
import { NotificationGatewaySocket } from '../gatewaySocket/gateway.socket';
import { SocketNotificationService } from '../../application/service/socket.notification.service';
import { UserModule } from 'src/contexts/user/infrastructure/module/user.module';
import { GroupModule } from 'src/contexts/group/infrastructure/module/group.module';

@Module({
  imports: [UserModule, GroupModule],
  providers: [
    NotificationGatewaySocket,
    {
      provide: 'SocketNotificationServiceInterface',
      useClass: SocketNotificationService,
    },
  ],
})
export class NotificationSocketModule {}
