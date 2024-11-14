import { Module } from '@nestjs/common';


import { SocketNotificationService } from '../../application/service/socket.notification.service';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { GroupModule } from 'src/contexts/module_group/group/infrastructure/module/group.module';
import { SocketAdapter } from '../adapter/socket.adapter';
import { SocketController } from '../controller/socket.controller';
import { GroupNotificator } from '../../application/service/group.notificator';
import { MagazineModule } from 'src/contexts/module_magazine/magazine/infrastructure/module/magazine.module';


@Module({
  imports: [UserModule, GroupModule, MagazineModule],
  providers: [
    {
      provide: 'SocketNotificationServiceInterface',
      useClass: SocketNotificationService,
    },
    {
      provide: 'SocketAdapterInterface',
      useClass: SocketAdapter,
    },
    {
      provide: 'GroupNotificatorInterface',
      useClass: GroupNotificator,
    },
  ],
  controllers: [SocketController],
})
export class NotificationSocketModule { }
