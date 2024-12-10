import { showDate } from "@/utils/functions/dates";
import { parseZonedDateTime } from "@internationalized/date";
import Link from "next/link";
import {
  NotificationCard,
  NotificationBody,
  NotificationOptions,
  NotificationOptionProps,
  NotificationImage,
} from "../NotificationCard";

import { useSocket } from "@/app/socketProvider";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { useState } from "react";
import {
  UserRelationNotification,
  UserRelationNotificationType,
} from "@/types/userTypes";
import { userRelationNotificationMessages } from "./notificationMessages";
import { PROFILE } from "@/utils/data/urls";
import { Image } from "@nextui-org/react";
import { relationTypes } from "@/utils/data/selectData";

const UserRelationNotificationCard = ({
  notification,
}: {
  notification: UserRelationNotification;
}) => {
  const {
    userRelation: { userFrom, typeRelation },
  } = notification.frontData;
  const { event, viewed, date, isActionsAvailable, backData, _id } =
    notification;
  const { usernameLogged } = useUserData();
  const { updateSocketToken } = useSocket();
  const [isActionSent, setIsActionSent] = useState(false);
  const getNotificationOptionsList = () => {
    const optionsList: NotificationOptionProps[] = [];
    const notificationMessage =
      userRelationNotificationMessages[event as UserRelationNotificationType];

    // Check if acceptAction exists before adding it to options
    if (
      notificationMessage?.acceptAction &&
      isActionsAvailable &&
      !isActionSent
    ) {
      optionsList.push({
        label: "Aceptar Solicitud",
        onPress: async () => {
          const socket = await updateSocketToken();
          notificationMessage.acceptAction?.(socket, backData.userIdFrom, _id);
          setIsActionSent(true);
        },
      });
    }
    if (notificationMessage?.seeNotifications) {
      optionsList.push({
        label: "Ver Solicitud",
        as: Link,
        href: `${PROFILE}/${usernameLogged}/solicitudes`,
      });
    }
    optionsList.push({
      label: "Ver Perfil",
      as: Link,
      className: "text-text-color",
      href: `${PROFILE}/${userFrom.username}`,
    });
    if (
      notificationMessage?.rejectAction &&
      isActionsAvailable &&
      !isActionSent
    ) {
      optionsList.push({
        label: "Rechazar Solicitud",
        color: "danger",
        onPress: async () => {
          const socket = await updateSocketToken();
          notificationMessage.rejectAction?.(socket, backData.userIdFrom, _id);
          setIsActionSent(true);
        },
      });
    }
    return optionsList;
  };
  return (
    <NotificationCard isNew={!viewed}>
      <NotificationImage>
        <Image
          radius="full"
          src={userFrom.profilePhotoUrl}
          alt={"foto de perfil de " + userFrom.username}
          className="object-cover w-16 h-16"
        />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">
          <span className="font-semibold">{userFrom.username}</span>{" "}
          {
            userRelationNotificationMessages[
              event as UserRelationNotificationType
            ].message
          }{" "}
          <span className="font-semibold">
            {relationTypes.find((r) => r.value === typeRelation)?.label ||
              typeRelation}
          </span>
        </p>
      </NotificationBody>
      <NotificationOptions
        date={showDate(parseZonedDateTime(date))}
        items={getNotificationOptionsList()}
      />
    </NotificationCard>
  );
};

export default UserRelationNotificationCard;
