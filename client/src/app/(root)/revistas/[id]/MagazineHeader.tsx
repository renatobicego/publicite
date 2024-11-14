import { GroupMagazine, Magazine, UserMagazine } from "@/types/magazineTypes";
import { Group } from "@/types/groupTypes";
import { GetUser } from "@/types/userTypes";
import { FILE_URL, PROFILE } from "@/utils/data/urls";
import { Avatar, AvatarGroup, Link } from "@nextui-org/react";
import MagazineOptionsDropdown from "./Options/MagazineOptionsDropdown";
interface MagazineProps {
  magazine: Magazine;
  ownerAsUser: GetUser;
  ownerAsGroup: Group;
  urlProfile: string;
  isOwnerTypeUser: boolean;
  canEdit: boolean;
}
const MagazineHeader = ({
  magazine,
  ownerAsUser,
  ownerAsGroup,
  urlProfile,
  isOwnerTypeUser,
  canEdit,
}: MagazineProps) => {
  const userMagazine = magazine as UserMagazine;
  const groupMagazine = magazine as GroupMagazine;

  return (
    <>
      <div className="w-full relative">
        {canEdit && (
          <MagazineOptionsDropdown
            collaborators={
              isOwnerTypeUser
                ? userMagazine.collaborators
                : groupMagazine.allowedCollaborators
            }
            ownerType={magazine.ownerType}
          />
        )}
        <h2 className="max-w-[95%] md:max-w-[75%] text-center mx-auto">
          {magazine.name}
        </h2>
      </div>
      <p className="md:max-w-[75%] xl:max-w-[50%] text-center text-sm lg:text-base">
        {magazine.description}
      </p>
      {userMagazine.collaborators && userMagazine.collaborators.length > 0 ? (
        <AvatarGroup>
          <Avatar
            src={
              isOwnerTypeUser
                ? ownerAsUser.profilePhotoUrl
                : ownerAsUser.profilePhotoUrl
                ? FILE_URL + ownerAsUser.profilePhotoUrl
                : "/groupLogo.png"
            }
            as={Link}
            href={urlProfile}
            size="lg"
            isBordered
            className="bg-white"
          />
          {(userMagazine.collaborators as GetUser[]).map((collaborator) => (
            <Avatar
              key={collaborator._id}
              as={Link}
              href={`${PROFILE}/${collaborator.username}`}
              src={collaborator.profilePhotoUrl}
              size="lg"
              isBordered
              className="bg-white"
            />
          ))}
        </AvatarGroup>
      ) : (
        <Link
          color="foreground"
          href={urlProfile}
          className="flex gap-2 items-center flex-col"
        >
          <Avatar
            src={
              isOwnerTypeUser
                ? ownerAsUser.profilePhotoUrl
                : ownerAsUser.profilePhotoUrl
                ? FILE_URL + ownerAsUser.profilePhotoUrl
                : "/groupLogo.png"
            }
            size="lg"
            isBordered
            className="bg-white"
          />
          <p className="font-semibold">
            {isOwnerTypeUser ? `@${ownerAsUser.username}` : ownerAsGroup.name}{" "}
          </p>
        </Link>
      )}
    </>
  );
};

export default MagazineHeader;
