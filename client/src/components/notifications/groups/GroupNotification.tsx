import { GROUPS } from "@/utils/data/urls";
import { parseIsoDate, showDate } from "@/utils/functions/dates";
import {
  NotificationCard,
  NotificationBody,
  NotificationOptions,
  NotificationOptionProps,
} from "../NotificationCard";

import GroupImage from "./GroupImage";
import { GroupNotification, GroupNotificationType } from "@/types/groupTypes";
import { groupNotificationMessages } from "./notificationMessages";
import { useSocket } from "@/app/socketProvider";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { useState } from "react";
import { checkAndAddDeleteNotification } from "../deleteNotification";
import { useNotificationsContext } from "@/app/(root)/providers/notificationsProvider";
import { Link } from "@nextui-org/react";
import { useNotificationsIsOpen } from "@/components/Header/Notifications/notificationsOptionsProvider";

const GroupNotificationCard = ({
  notification,
}: {
  notification: GroupNotification;
}) => {
  const { setIsOpen } = useNotificationsIsOpen();
  const { group } = notification.frontData;
  const { event, viewed, date, isActionsAvailable, backData, _id } =
    notification;
  const { userIdLogged, usernameLogged } = useUserData();
  const { socket } = useSocket();
  const [isActionSent, setIsActionSent] = useState(false);
  const { deleteNotification } = useNotificationsContext();
  const getNotificationOptionsList = () => {
    const optionsList: NotificationOptionProps[] = [];
    const notificationMessage =
      groupNotificationMessages[event as GroupNotificationType];

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
            {
              _id: group._id,
              name: group.name,
              profilePhotoUrl: group.profilePhotoUrl,
            },
            {
              _id: userIdLogged,
              username: usernameLogged,
            },
            backData.userIdFrom,
            _id
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
        href: `${GROUPS}/${group._id}/solicitudes`,
      });
    }
    optionsList.push({
      label: "Ver Grupo",
      as: Link,
      color: "default",
      onClick: () => setIsOpen(false),
      className: "text-text-color",
      href: `${GROUPS}/${group._id}`,
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
            {
              _id: group._id,
              name: group.name,
              profilePhotoUrl: group.profilePhotoUrl,
            },
            {
              _id: userIdLogged,
              username: usernameLogged,
            },
            backData.userIdFrom,
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
    <NotificationCard isNew={!viewed} id={_id}>
      <GroupImage group={group} />
      <NotificationBody>
        <p className="text-sm">
          {groupNotificationMessages[event as GroupNotificationType]
            .showUser && (
            <span className="font-semibold">
              {notification.frontData.group.userInviting.username}
            </span>
          )}{" "}
          {groupNotificationMessages[event as GroupNotificationType].message}
          <span className="font-semibold"> {group.name}</span>
        </p>
      </NotificationBody>
      <NotificationOptions
        date={showDate(parseIsoDate(date))}
        items={getNotificationOptionsList()}
      />
    </NotificationCard>
  );
};

export default GroupNotificationCard;
