import { Types } from "mongoose";
import { title } from "process";
enum OwnerType {
    user = 'user',
    group = 'group',
}
class GroupMagazineRequest_test {
    _id: Types.ObjectId;
    name?: string;
    sections?: any[];
    description?: string;
    allowedCollaborators?: any[];
    group: Types.ObjectId;

}

async function insertGroupMagazine(groupMagazineModel: any, groupMagazineRequest: GroupMagazineRequest_test) {
    await groupMagazineModel.create(
        {
            _id: groupMagazineRequest._id,
            name: groupMagazineRequest.name ?? 'Group Magazine Test',
            sections: groupMagazineRequest.sections ?? [],
            ownerType: OwnerType.group,
            description: groupMagazineRequest.description ?? "Description",
            allowedCollaborators: groupMagazineRequest.allowedCollaborators ?? [],
            group: groupMagazineRequest.group
        }
    )

    return groupMagazineRequest;

}


class UserMagazineRequest_test {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    name?: string;
    sections?: any[];
    description?: string;
    collaborators?: any[];
    visibility?: string

}


async function insertUserMagazine(userMagazineModel: any, userMagazineRequest: UserMagazineRequest_test) {
    await userMagazineModel.create(
        {
            _id: userMagazineRequest._id,
            user: userMagazineRequest.user,
            name: userMagazineRequest.name ?? 'User Magazine Test',
            sections: userMagazineRequest.sections ?? [],
            ownerType: OwnerType.user,
            description: userMagazineRequest.description ?? "Description",
            collaborators: userMagazineRequest.collaborators ?? [],
            visibility: userMagazineRequest.visibility ?? "public",
        }
    )

    return userMagazineRequest;

}

class SectionRequest_test {
    _id: Types.ObjectId;
    title?: string;
    posts?: Types.ObjectId[];
    isFatherSection?: boolean;

}


async function insertSection(sectionModel: any, sectionRequest: SectionRequest_test) {
    await sectionModel.create(
        {
            _id: sectionRequest._id,
            title: sectionRequest.title ?? 'Section Test',
            posts: sectionRequest.posts ?? [],
            isFatherSection: sectionRequest.isFatherSection ?? true

        }
    )

    return sectionRequest;
}

export { insertGroupMagazine, insertUserMagazine, insertSection }