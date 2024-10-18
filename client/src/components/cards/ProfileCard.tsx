import { User, UserBusiness } from "@/types/userTypes";
import { Avatar, Card, CardBody, Link } from "@nextui-org/react";
import { TbWorldPin } from "react-icons/tb";
import SendRequest from "../buttons/SendRequest";
import { PROFILE } from "@/utils/data/urls";
import HandleGroupMember from "../buttons/HandleGroupMember";

const ProfileCard = ({
  user,
  groupGrid,
  groupId,
  isAdmin,
}: {
  user: User;
  groupGrid?: boolean;
  groupId?: string;
  isAdmin?: boolean;
}) => {
  const { userType } = user;
  const nameToShow =
    userType === "Business"
      ? (user as UserBusiness).businessName
      : `${user.name} ${user.lastName}`;
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
            <h6>{groupGrid ? user.username : nameToShow}</h6>
          </Link>
          {!groupGrid ? (
            <>
              <div className="flex items-center gap-1">
                <TbWorldPin className="size-4 min-w-4" />
                <p className="text-xs md:text-sm">{user.countryRegion}</p>
              </div>
              <SendRequest />
            </>
          ) : (
            <>
              {isAdmin && <p className="text-xs font-normal italic">Administrador</p>}
              <HandleGroupMember
                user={user}
                nameToShow={user.username}
                groupId={groupId}
                isAdmin={isAdmin}
              />
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default ProfileCard;
