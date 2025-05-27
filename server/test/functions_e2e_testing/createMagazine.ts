import { Types, Connection } from "mongoose"

class UserMagazineRequest {
    _id?: Types.ObjectId;
    name?: string
    sections?: Types.ObjectId[];
    description?: string
    user?: Types.ObjectId;
    kind?: string;
    collaborators?: Types.ObjectId[];
    visibility?: string;
    ownerType?: string
}


async function createUserMagazine_e2e(userMagazineRequest: UserMagazineRequest, dbConnection: Connection) {
    userMagazineRequest = {
        _id: userMagazineRequest._id ?? new Types.ObjectId(),
        name: userMagazineRequest.name ?? 'User Magazine Test',
        sections: userMagazineRequest.sections ?? [],
        description: userMagazineRequest.description ?? "Description",
        user: userMagazineRequest.user ?? new Types.ObjectId(),
        kind: "UserMagazine",
        collaborators: userMagazineRequest.collaborators ?? [],
        visibility: userMagazineRequest.visibility ?? "public",
        ownerType: "user",
    }

    await dbConnection.collection('magazines').insertOne(userMagazineRequest);
    return userMagazineRequest;
}


class GroupMagazineRequest {
    _id?: Types.ObjectId;
    name?: string;
    sections?: Types.ObjectId[];
    ownerType?: string;
    description?: string
    allowedCollaborators?: Types.ObjectId[]
    group?: Types.ObjectId;
    kind?: string;
}



async function createGroupMagazine_e2e(groupMagazineRequest: GroupMagazineRequest, dbConnection: Connection) { 
    groupMagazineRequest = {
        _id: groupMagazineRequest._id ?? new Types.ObjectId(),
        name: groupMagazineRequest.name ?? 'Group Magazine Test',
        sections: groupMagazineRequest.sections ?? [],
        ownerType: "group",
        description: groupMagazineRequest.description ?? "Description",
        allowedCollaborators: groupMagazineRequest.allowedCollaborators ?? [],
        group: groupMagazineRequest.group,
        kind: "GroupMagazine"
    }
    await dbConnection.collection('magazines').insertOne(groupMagazineRequest);
    return groupMagazineRequest;
    
}


export { createUserMagazine_e2e, createGroupMagazine_e2e }