import { Notification } from "./notification.entity";


export class NotificationContactSeller extends Notification {
    private frontData: {
        contactSeller: {
            post: {
                _id: any,
            }
            client: {
                clientId: any,
                name: string,
                email: string,
                lastName: string,
                username: string,
                phone: string,
                message: string
            }
        }
    };


    constructor(notification: Notification,
        frontData: {
            contactSeller: {
                post: {
                    _id: any,
                }
                client: {
                    clientId: any,
                    name: string,
                    email: string,
                    lastName: string,
                    username: string,
                    phone: string,
                    message: string
                }
            }

        }
    ) {
        super(notification.getEvent,
            notification.getViewed,
            notification.getDate,
            notification.getUser,
            notification.getIsActionsAvailable,
            notification.getbackData,
            notification.getSocketJobId,
            notification.getType,
            notification.getNotificationEntityId,
            notification.getpreviousNotificationId as string
        );

        this.frontData = frontData;
    }

    get getFrontData() {
        return this.frontData
    }

    get getPostContactSeller() {
        return this.frontData.contactSeller.post
    }

    get getClientContactSeller() {
        return this.frontData.contactSeller.client
    }
}