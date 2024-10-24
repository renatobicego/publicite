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
  if (isGroupMagazine) {
    return {
      ...values,
      group: id,
    } as PostGroupMagazine;
  }

  const baseValues = {
    ...values,
    user: userId,
  } as PostUserMagazine;

  if (shareMagazineIds) {
    return {
      ...baseValues,
      addedPost: shareMagazineIds.post || null,
    };
  } else if (id) {
    return {
      ...baseValues,
      addedPost: id,
    };
  }

  return baseValues;
};
