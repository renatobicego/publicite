import { MyLoggerService } from 'src/contexts/shared/logger/logger.service';
import { SocketNotificationServiceInterface } from '../../domain/service/socket.notification.service.interface';
import { Inject } from '@nestjs/common';
import { UserServiceInterface } from 'src/contexts/user/domain/service/user.service.interface';
export class SocketNotificationService
  implements SocketNotificationServiceInterface
{
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('UserServiceInterface')
    private readonly userService: UserServiceInterface,
  ) {}
  async sendNotificationToUser(notification: any): Promise<any> {
    try {
      this.logger.log('Sending new notification to user');
      await this.userService.pushNotification(notification);
    } catch (error: any) {
      this.logger.error('An error occurred while sending notification to user');
      this.logger.error(error);
      throw error;
    }
  }
}
