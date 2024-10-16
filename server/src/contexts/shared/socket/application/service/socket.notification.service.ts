import { SocketNotificationServiceInterface } from '../../domain/service/socket.notification.service.interface';
import { Notification } from '../../domain/entity/notification.entity';
export class SocketNotificationService
  implements SocketNotificationServiceInterface
{
  async sendNotificationToUser(d: any): Promise<any> {
    const { data } = d;
    try {
      const notificationToSend = new Notification(
        data.toId,
        data.message,
        data.ids,
      );
      console.log(notificationToSend);

      return notificationToSend; //Deberiamos llamar al servicio para pushear la notificacion
    } catch (error: any) {
      throw error;
    }
  }
}
