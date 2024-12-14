import { Module } from '@nestjs/common';


//import { SocketNotificationService } from '../../application/service/socket.notification.service';
import { SocketAdapter } from '../adapter/socket.adapter';
import { SocketController } from '../controller/socket.controller';
import { NotificationModule } from 'src/contexts/module_user/notification/infrastructure/module/notification.module';


@Module({
  imports: [NotificationModule],
  providers: [
    {
      provide: 'SocketAdapterInterface',
      useClass: SocketAdapter,
    },
  ],
  controllers: [SocketController],
})
export class NotificationSocketModule { }
