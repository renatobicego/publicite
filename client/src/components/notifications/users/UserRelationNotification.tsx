import { parseIsoDate, showDate } from "@/utils/functions/dates";
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
import { Image, Link, user } from "@nextui-org/react";
import { relationTypes } from "@/utils/data/selectData";
import { checkAndAddDeleteNotification } from "../deleteNotification";
import { useNotificationsContext } from "@/app/(root)/providers/notificationsProvider";
import { useNotificationsIsOpen } from "@/components/Header/Notifications/notificationsOptionsProvider";

const UserRelationNotificationCard = ({
  notification,
}: {
  notification: UserRelationNotification;
}) => {
  const { setIsOpen } = useNotificationsIsOpen();
  const {
    userRelation: { userFrom, typeRelation, _id: userRelationId },
  } = notification.frontData;
  const { event, viewed, date, isActionsAvailable, backData, _id } =
    notification;
  const { userIdLogged } = useUserData();
  const { socket } = useSocket();
  const { deleteNotification } = useNotificationsContext();
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
          notificationMessage.acceptAction?.(
            socket,
            backData.userIdFrom,
            typeRelation,
            _id,
            userRelationId
          );
          setIsActionSent(true);
        },
      });
    }
    if (notificationMessage?.seeNotifications) {
      optionsList.push({
        label: "Ver Solicitud",
        as: Link,
        color: "default",
        onClick: () => setIsOpen(false),
        href: `${PROFILE}/${userIdLogged}/solicitudes`,
      });
    }
    optionsList.push({
      label: "Ver Perfil",
      as: Link,
      color: "default",
      onClick: () => setIsOpen(false),
      className: "text-text-color",
      href: `${PROFILE}/${userFrom._id}`,
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
          notificationMessage.rejectAction?.(
            socket,
            backData.userIdFrom,
            typeRelation,
            _id
          );
          setIsActionSent(true);
        },
      });
    }
    checkAndAddDeleteNotification(optionsList, event, _id, deleteNotification);
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
        date={showDate(parseIsoDate(date))}
        items={getNotificationOptionsList()}
      />
    </NotificationCard>
  );
};

export default UserRelationNotificationCard;
