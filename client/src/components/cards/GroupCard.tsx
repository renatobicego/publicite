import { GetGroups } from "@/types/groupTypes";
import { Avatar, Card, CardBody, Link } from "@nextui-org/react";
import { FILE_URL, GROUPS } from "@/utils/data/urls";
import SendRequest from "../buttons/SendRequest/SendRequest";
import SecondaryButton from "../buttons/SecondaryButton";
import AcceptGroupInvitation from "../buttons/SendRequest/AcceptGroupInvitation";

const GroupCard = ({
  group,
  isUserProfile,
}: {
  group: GetGroups;
  isUserProfile?: boolean;
}) => {
  const { group: groupData } = group;
  const actionButtonToReturn = () => {
    switch (true) {
      case isUserProfile:
        return;
      case group.isMember:
        return (
          <SecondaryButton as={Link} href={`${GROUPS}/${groupData._id}`}>
            Ver Grupo
          </SecondaryButton>
        );
      case group.hasGroupRequest:
        return <AcceptGroupInvitation />;
      case group.hasJoinRequest:
        return (
          <p className="text-sm lg:text-small text-light-text">
            Solicitud Enviada
          </p>
        );
      default:
        return (
          <SendRequest
            isGroup
            idToSendRequest={groupData._id}
          />
        );
    }
  };
  return (
    <Card className="bg-fondo">
      <CardBody className="sm:flex-row gap-2 md:gap-6 sm:items-center">
        <Avatar
          className="shrink-0 bg-white"
          isBordered
          src={
            groupData.profilePhotoUrl
              ? FILE_URL + groupData.profilePhotoUrl
              : "/groupLogo.png"
          }
          classNames={{
            base: "!w-14 md:!w-16 2xl:!w-20 !h-14 md:!h-16 2xl:!h-20",
          }}
        />
        <div className="flex flex-col gap-2 md:gap-1 items-start flex-1">
          <Link color="foreground" href={`${GROUPS}/${groupData._id}`}>
            <h6>{groupData.name}</h6>
          </Link>
          <p className="text-xs md:text-sm">
            {groupData.members.length + 1} miembros
          </p>
          {actionButtonToReturn()}
        </div>
      </CardBody>
    </Card>
  );
};

export default GroupCard;
