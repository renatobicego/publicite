import {
  UserRelationNotification,
  UserRelationNotificationType,
} from "@/types/userTypes";
import { relationTypes } from "@/utils/data/selectData";
import { PROFILE } from "@/utils/data/urls";
import { Card, CardBody, Avatar, user, Link } from "@nextui-org/react";
import HandleUserRelationRequest from "./HandleUserRelationRequest";

const UserRelationCard = ({
  userRelation,
}: {
  userRelation: UserRelationNotification;
}) => {
  const {
    frontData: {
      userRelation: { userFrom, typeRelation },
    },
    event,
  } = userRelation;
  const isChangeOfRelation =
    (event as UserRelationNotificationType) ===
    "notification_user_new_relation_change";
  return (
    <Card className="bg-fondo">
      <CardBody className="sm:flex-row gap-2 md:gap-4 lg:gap-6 sm:items-center">
        <Avatar
          className="shrink-0"
          isBordered
          src={userFrom.profilePhotoUrl}
          classNames={{
            base: "!w-14 md:!w-16 2xl:!w-20 !h-14 md:!h-16 2xl:!h-20",
          }}
        />
        <div className="flex flex-col gap-2 md:gap-1 items-start flex-1">
          <Link
            className="text-text-color hover:text-primary"
            href={`${PROFILE}/${userFrom.username}`}
          >
            <h6>{userFrom.username}</h6>
          </Link>
          <p className="text-xs font-normal italic">
            {isChangeOfRelation && "Cambio de relación a "}
            {relationTypes.find((r) => r.value === typeRelation)?.label}
          </p>
          <HandleUserRelationRequest userRelation={userRelation} />
        </div>
      </CardBody>
    </Card>
  );
};

export default UserRelationCard;
