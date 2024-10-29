import { Module } from '@nestjs/common';

import { NotificationGatewaySocket } from '../gatewaySocket/gateway.socket';
import { SocketNotificationService } from '../../application/service/socket.notification.service';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { GroupModule } from 'src/contexts/module_group/group/infrastructure/module/group.module';

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
