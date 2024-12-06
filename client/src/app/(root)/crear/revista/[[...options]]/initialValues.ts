import {
  GroupMagazine,
  PostGroupMagazine,
  PostUserMagazine,
  UserMagazine,
} from "@/types/magazineTypes";

export const userMagazine: Omit<UserMagazine, "_id"> = {
  collaborators: [],
  description: "",
  name: "",
  sections: [],
  user: "",
  ownerType: "user",
  visibility: "public",
};

export const groupMagazine: Omit<GroupMagazine, "_id"> = {
  allowedCollaborators: [],
  description: "",
  name: "",
  sections: [],
  group: "",
  visibility: "public",
  ownerType: "group",
};
export const createMagazineValues = (
  values: PostUserMagazine | PostGroupMagazine,
  isGroupMagazine: boolean,
  id: string | null,
  shareMagazineIds: { user: string; post: string } | null,
  userId: any
) => {
  // if is group magazine, add group id
  if (isGroupMagazine) {
    return {
      ...values,
      group: id,
    } as PostGroupMagazine;
  }

  // if is user magazine, add user id of the creator
  const baseValues = {
    ...values,
    user: userId,
  } as PostUserMagazine;

  // add post id
  if (shareMagazineIds) {
    return {
      ...baseValues,
      addedPost: shareMagazineIds.post || null, // if is shared magazine, post id will be inside the object shareMagazineIds
    };
  } else if (id) {
    return {
      ...baseValues,
      addedPost: id, // if is common magazine, id will be the id of the post to add
    };
  }

  return baseValues;
};
