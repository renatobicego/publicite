import { Module } from '@nestjs/common';


import { SocketNotificationService } from '../../application/service/socket.notification.service';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { GroupModule } from 'src/contexts/module_group/group/infrastructure/module/group.module';
import { SocketContrroller } from '../controller/gateway.socket';
import { SocketAdapter } from '../adapter/socket.adapter';

@Module({
  imports: [UserModule, GroupModule],
  providers: [
    {
      provide: 'SocketNotificationServiceInterface',
      useClass: SocketNotificationService,
    },
    {
      provide: 'SocketAdapterInterface',
      useClass: SocketAdapter,
    },
  ],
  controllers: [SocketContrroller],
})
export class NotificationSocketModule { }
