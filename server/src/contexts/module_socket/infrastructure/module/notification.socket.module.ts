import { Module } from '@nestjs/common';


//import { SocketNotificationService } from '../../application/service/socket.notification.service';
import { SocketAdapter } from '../adapter/socket.adapter';
import { SocketController } from '../controller/socket.controller';
import { NotificationModule } from 'src/contexts/module_user/notification/infrastructure/module/notification.module';
import { NotificationService } from 'src/contexts/module_user/notification/application/service/notification.service';
import { UserModule } from 'src/contexts/module_user/user/infrastructure/module/user.module';
import { GroupModule } from 'src/contexts/module_group/group/infrastructure/module/group.module';
import { MagazineModule } from 'src/contexts/module_magazine/magazine/infrastructure/module/magazine.module';
import { PostModule } from 'src/contexts/module_post/post/infraestructure/module/post.module';


@Module({
  imports: [NotificationModule, UserModule, GroupModule, MagazineModule, PostModule],
  providers: [
    {
      provide: 'SocketAdapterInterface',
      useClass: SocketAdapter,
    },
    {
      provide: 'NotificationPostServiceInterface',
      useClass: NotificationService,
    },

  ],
  controllers: [SocketController],
})
export class NotificationSocketModule { }
