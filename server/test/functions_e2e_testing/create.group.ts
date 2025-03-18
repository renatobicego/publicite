import { Connection, Types } from "mongoose";
import { Visibility } from "src/contexts/module_user/board/infrastructure/enum/visibility.enum.board";

class GroupTestRequest {
    _id: Types.ObjectId;
    alias?: string;
    name?: string;
    creator?: Types.ObjectId;
    visibility?: Visibility;
    members?: Types.ObjectId[];
    admins?: Types.ObjectId[];
    magazines?: Types.ObjectId[];
    groupNotificationsRequest?: {
        joinRequests: Types.ObjectId[];
        groupInvitations: Types.ObjectId[];
    }
    userIdAndNotificationMap?: Map<string, string>;
}



async function createTestingGroup_e2e(createGroupTestRequest: GroupTestRequest, dbConnection: Connection) {
    createGroupTestRequest = {
        _id: createGroupTestRequest._id ?? new Types.ObjectId(),
        alias: createGroupTestRequest.alias ?? 'Group Test',
        name: createGroupTestRequest.name ?? 'Group Test',
        creator: createGroupTestRequest.creator ?? new Types.ObjectId(),
        visibility: createGroupTestRequest.visibility ?? Visibility.public,
        members: createGroupTestRequest.members ?? [],
        admins: createGroupTestRequest.admins ?? [],
        magazines: createGroupTestRequest.magazines ?? [],
        groupNotificationsRequest: createGroupTestRequest.groupNotificationsRequest ?? {
            joinRequests: [],
            groupInvitations: [],
        },
        userIdAndNotificationMap: createGroupTestRequest.userIdAndNotificationMap ?? new Map(),
    }
    await dbConnection.collection('groups').insertOne(createGroupTestRequest)
    return createGroupTestRequest;
}

export default createTestingGroup_e2e 