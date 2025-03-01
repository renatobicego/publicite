import { Types } from "mongoose";
import { Visibility } from "src/contexts/module_group/group/domain/entity/enum/group.visibility.enum";


export class GroupTestRequest {
    _id: Types.ObjectId;
    alias: string;
    creator: Types.ObjectId;
    visibility: Visibility;
    members?: Types.ObjectId[];
    admins?: Types.ObjectId[];
    magazines?: Types.ObjectId[];
    groupNotificationsRequest?: {
        joinRequests: Types.ObjectId[];
        groupInvitations: Types.ObjectId[];
    }
    userIdAndNotificationMap?: Map<string, string>;
}


async function createGroup(
    groupRequest: GroupTestRequest,
    groupModel: any,
) {
    const GROUP = await groupModel.create({
        _id: groupRequest._id,
        members: groupRequest.members ?? [],
        admins: groupRequest.admins ?? [],
        name: "Grupo testing",
        alias: groupRequest.alias,
        rules: "nothing here",
        magazines: groupRequest.magazines ?? [],
        details: "details",
        profilePhotoUrl: "www.test.com",
        visibility: groupRequest.visibility,
        groupNote: "Hello world",
        creator: groupRequest.creator,
        groupNotificationsRequest: groupRequest.groupNotificationsRequest ?? {
            joinRequests: [],
            groupInvitations: [],
        },
        userIdAndNotificationMap: groupRequest.userIdAndNotificationMap ?? new Map<string, string>(),



    });
    return GROUP
}

export { createGroup }