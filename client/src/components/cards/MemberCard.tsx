import { User } from "@/types/userTypes";
import { Avatar, Card, CardBody, Link } from "@nextui-org/react";
import { PROFILE } from "@/utils/data/urls";
import HandleGroupMember from "../buttons/HandleGroupMember";
import { Group } from "@/types/groupTypes";

const MemberCard = ({
  user,
  group,
  isAdmin,
  userLogged,
}: {
  user: User;
  group: Group;
  isAdmin?: boolean;
  userLogged: { username: string; _id: string };
}) => {
  return (
    <Card className="bg-fondo">
      <CardBody className="sm:flex-row gap-2 md:gap-4 lg:gap-6 sm:items-center">
        <Avatar
          className="shrink-0"
          isBordered
          src={user.profilePhotoUrl}
          classNames={{
            base: "!w-14 md:!w-16 2xl:!w-20 !h-14 md:!h-16 2xl:!h-20",
          }}
        />
        <div className="flex flex-col gap-2 md:gap-1 items-start flex-1">
          <Link
            className="text-text-color hover:text-primary"
            href={`${PROFILE}/${user.username}`}
          >
            <h6>{user.username}</h6>
          </Link>

          {isAdmin && (
            <p className="text-xs font-normal italic">Administrador</p>
          )}
          <HandleGroupMember
            user={user}
            nameToShow={user.username}
            group={group}
            isAdmin={isAdmin}
            userLogged={{ username: userLogged.username, _id: userLogged._id }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default MemberCard;
