import { Group } from "@/types/groupTypes";
import { GroupMagazine, Magazine, UserMagazine } from "@/types/magazineTypes";
import { GetUser } from "@/types/userTypes";
import { PROFILE } from "@/utils/data/urls";

function getOwner(magazine: Magazine): GetUser | Group  {
  return magazine.ownerType === "user"
    ? (magazine as UserMagazine).user as GetUser
    : (magazine as GroupMagazine).group as Group;
}

function checkIsOwner(
  magazine: Magazine,
  owner: GetUser | Group,
  user: any // Clerk's user type or customize it as needed
): boolean {
  if (magazine.ownerType === "user") {
    return (owner as GetUser).username === user?.username;
  }
  return ((magazine as GroupMagazine).allowedCollaborators as string[]).includes(
    user?.publicMetadata.mongoId as string
  );
}

function getProfileUrl(
  owner: GetUser | Group,
  isOwnerTypeUser: boolean
): string {
  return isOwnerTypeUser
    ? `${PROFILE}/${(owner as GetUser).username}`
    : `${PROFILE}/${(owner as Group)._id}`;
}

export { getOwner, checkIsOwner, getProfileUrl };
