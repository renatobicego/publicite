import { GroupMagazine, UserMagazine } from "@/types/postTypes";

export type PostUserMagazine = Omit<UserMagazine, "_id">
export type PostGroupMagazine = Omit<GroupMagazine, "_id">
export const userMagazine: Omit<UserMagazine, "_id"> = {
    collaborators: [],
    description: "",
    name: "",
    sections: [],
    user: "",
    ownerType: "user",
    visibility: "public"
}

export const groupMagazine: Omit<GroupMagazine, "_id"> = {
    allowedCollaborators: [],
    description: "",
    name: "",
    sections: [],
    group: "",
    ownerType: "group",
}