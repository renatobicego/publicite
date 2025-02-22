import { Types } from "mongoose";

async function createSection(
    section_id: Types.ObjectId,
    sectionModel: any,
    posts: Types.ObjectId[],
    isFatherSection: boolean) {
    const SECTION = await sectionModel.create({
        _id: section_id,
        title: 'Section 1',
        posts: posts,
        isFatherSection: isFatherSection,
    });
    return SECTION

}



async function createUserMagazine(
    magazine_id: Types.ObjectId,
    magazineModel: any,
    author: Types.ObjectId,
    sectios: Types.ObjectId[]) {
    const MAGAZINE = await magazineModel.create({
        _id: magazine_id,
        name: 'Magazine 1',
        sections: sectios ?? [],
        ownerType: "user",
        description: 'Description 1',
        user: author,
        visibility: 'public',
    });

    return MAGAZINE
}


async function createGroupMagazine(
    magazine_id: Types.ObjectId,
    magazineModel: any,
    group_id: Types.ObjectId,
    sectios: Types.ObjectId[],
    allowedCollaborators?: Types.ObjectId[]) {
    const MAGAZINE = await magazineModel.create({
        _id: magazine_id,
        name: 'Magazine 1',
        sections: sectios ?? [],
        ownerType: "group",
        description: 'Description 1',
        allowedCollaborators: allowedCollaborators ?? [],
        group: group_id,
    });
    return MAGAZINE
}
export { createUserMagazine, createGroupMagazine, createSection }