import { Module } from '@nestjs/common';


import { SocketNotificationService } from '../../application/service/socket.notification.service';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { GroupModule } from 'src/contexts/module_group/group/infrastructure/module/group.module';
import { SocketAdapter } from '../adapter/socket.adapter';
import { SocketController } from '../controller/group.socket.controller';


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
  controllers: [SocketController],
})
export class NotificationSocketModule { }
