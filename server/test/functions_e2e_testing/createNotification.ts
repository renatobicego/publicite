import { Connection, Types } from "mongoose";

interface NotificationTestRequest {
    _id?: Types.ObjectId;
    event?: string;
    viewed?: boolean;
    date?: string;
    user?: string;
    isActionsAvailable?: boolean;
    backData?: {
        userIdTo?: string;
        userIdFrom?: string;
    };
    socketJobId?: string;
    type?: string;
    notificationEntityId?: string;
    previousNotificationId?: string | null;
    kind?: string;
    frontData?: {
        group?: {
            _id?: Types.ObjectId;
            name?: string;
            profilePhotoUrl?: string;
        };
        userInviting?: {
            _id?: Types.ObjectId;
            username?: string;
        };
    };
}

async function createTestingNotification_e2e(notificationRequest: NotificationTestRequest, dbConnection: Connection) {

    notificationRequest = {
        _id: notificationRequest._id ?? new Types.ObjectId(),
        event: notificationRequest.event ?? "default_event",
        viewed: notificationRequest.viewed ?? false,
        date: notificationRequest.date ?? new Date().toISOString(),
        user: notificationRequest.user ?? new Types.ObjectId().toString(),
        isActionsAvailable: notificationRequest.isActionsAvailable ?? true,
        backData: {
            userIdTo: notificationRequest.backData?.userIdTo ?? new Types.ObjectId().toString(),
            userIdFrom: notificationRequest.backData?.userIdFrom ?? new Types.ObjectId().toString(),
        },
        socketJobId: notificationRequest.socketJobId ?? "default_socket_job_id",
        type: notificationRequest.type ?? "default_type",
        notificationEntityId: notificationRequest.notificationEntityId ?? new Types.ObjectId().toString(),
        previousNotificationId: notificationRequest.previousNotificationId ?? null,
        kind: notificationRequest.kind ?? "default_kind",
        frontData: {
            group: {
                _id: notificationRequest.frontData?.group?._id ?? new Types.ObjectId(),
                name: notificationRequest.frontData?.group?.name ?? "default_group_name",
                profilePhotoUrl: notificationRequest.frontData?.group?.profilePhotoUrl ?? "default_profile_photo_url",
            },
            userInviting: {
                _id: notificationRequest.frontData?.userInviting?._id ?? new Types.ObjectId(),
                username: notificationRequest.frontData?.userInviting?.username ?? "default_username",
            },
        },
    };

    await dbConnection.collection('Notifications').insertOne(notificationRequest);
    return notificationRequest;
}

export default createTestingNotification_e2e;