import { Types } from "mongoose";
import { Visibility } from "src/contexts/module_group/group/domain/entity/enum/group.visibility.enum";

async function createGroup(
    groupModel: any,
    alias: string,
    group_id: Types.ObjectId,
    creator: Types.ObjectId,
    visibility: Visibility

) {
    const GROUP = await groupModel.create({
        _id: group_id,
        members: [],
        admins: [],
        name: "Grupo testing",
        alias: alias,
        rules: "nothing here",
        magazines: [],
        details: "details",
        profilePhotoUrl: "www.test.com",
        visibility: visibility,
        groupNote: "Hello world",
        creator: creator,
        groupNotificationsRequest: {
            joinRequests: [],
            groupInvitations: [],
        },
    });

    return GROUP
}

export { createGroup }