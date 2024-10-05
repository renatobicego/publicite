import { Magazine } from "@/types/postTypes";
import { GetUser, Group } from "@/types/userTypes";
import { Avatar, Link } from "@nextui-org/react";
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
  return (
    <>
      <h2>{magazine.name}</h2>
      <p className="md:max-w-[75%] xl:max-w-[50%] text-center text-sm lg:text-base">
        {magazine.description}
      </p>
      <Link
        color="foreground"
        href={urlProfile}
        className="flex gap-2 items-center flex-col"
      >
        <Avatar src={ownerAsUser.profilePhotoUrl} size="lg" />
        <p className="font-semibold">
          {isOwnerTypeUser ? `@${ownerAsUser.username}` : ownerAsGroup.name}{" "}
        </p>
      </Link>
    </>
  );
};

export default MagazineHeader;
