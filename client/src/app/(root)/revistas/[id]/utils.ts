import { Group } from "@/types/groupTypes";
import { GroupMagazine, Magazine, UserMagazine } from "@/types/magazineTypes";
import { GetUser, User } from "@/types/userTypes";
import { GROUPS, PROFILE } from "@/utils/data/urls";

function getOwner(magazine: Magazine): GetUser | Group {
  return magazine.ownerType === "user"
    ? ((magazine as UserMagazine).user as GetUser)
    : ((magazine as GroupMagazine).group as Group);
}

function checkIsOwner(
  magazine: Magazine,
  owner: GetUser | Group,
  userId: string // Clerk's user type or customize it as needed
): boolean {
  if (magazine.ownerType === "user") {
    return (owner as GetUser)._id === userId;
  }
  const groupData: Group = (magazine as GroupMagazine).group as Group;
  return (
    groupData.admins.some((admin) => admin === userId) ||
    groupData.creator === userId
  );
}

function getProfileUrl(
  owner: GetUser | Group,
  isOwnerTypeUser: boolean
): string {
  return isOwnerTypeUser
    ? `${PROFILE}/${(owner as GetUser).username}`
    : `${GROUPS}/${(owner as Group)._id}`;
}

export { getOwner, checkIsOwner, getProfileUrl };
