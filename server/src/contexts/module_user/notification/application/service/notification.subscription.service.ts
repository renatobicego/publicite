import { NotificationSubscriptionServiceInterface } from "../../domain/service/Notification.subscription.service.interface";

export class NotificationSubscriptionService implements NotificationSubscriptionServiceInterface{

    constructor(
        
    ){

    }
   async createNotificationAndSendToUser(notification: any): Promise<void> {
        try{

        }catch(error:any){
            throw error;
        }
    }
    
}