import { Connection, Types } from "mongoose";

interface NotificationTestRequest {
    _id: Types.ObjectId;
    event: string;
    viewed: boolean;
    date: string;
    user: string;
    isActionsAvailable: boolean;
    backData: {
        userIdTo: string;
        userIdFrom: string;
    };
    socketJobId: string;
    type: string;
    notificationEntityId: string;
    previousNotificationId: string | null;
    kind: string;
    frontData: {
        group: {
            _id: Types.ObjectId;
            name: string;
            profilePhotoUrl: string;
        };
        userInviting: {
            _id: Types.ObjectId;
            username: string;
        };
    };
}

async function createTestingNotification_e2e(notificationRequest: NotificationTestRequest, dbConnection: Connection) {
    await dbConnection.collection('Notifications').insertOne(notificationRequest);
    return notificationRequest;
}

export default createTestingNotification_e2e;
