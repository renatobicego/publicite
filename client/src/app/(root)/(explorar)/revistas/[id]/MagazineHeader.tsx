import { Magazine, UserMagazine } from "@/types/postTypes";
import { GetUser, Group } from "@/types/userTypes";
import { PROFILE } from "@/utils/data/urls";
import { Avatar, AvatarGroup, Link } from "@nextui-org/react";
interface MagazineProps {
  magazine: Magazine;
  ownerAsUser: GetUser;
  ownerAsGroup: Group;
  urlProfile: string;
  isOwnerTypeUser: boolean;
}
const MagazineHeader = ({
  magazine,
  ownerAsUser,
  ownerAsGroup,
  urlProfile,
  isOwnerTypeUser,
}: MagazineProps) => {
  const userMagazine = magazine as UserMagazine;
  return (
    <>
      <h2>{magazine.name}</h2>
      <p className="md:max-w-[75%] xl:max-w-[50%] text-center text-sm lg:text-base">
        {magazine.description}
      </p>
      {userMagazine.collaborators && userMagazine.collaborators.length > 0 ? (
        <AvatarGroup>
          <Avatar
            src={
              ownerAsUser.profilePhotoUrl
                ? ownerAsUser.profilePhotoUrl
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
              ownerAsUser.profilePhotoUrl
                ? ownerAsUser.profilePhotoUrl
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
