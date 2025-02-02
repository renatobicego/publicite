import { GROUPS } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseZonedDateTime } from "@internationalized/date";
import Link from "next/link";
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

const GroupNotificationCard = ({
  notification,
}: {
  notification: GroupNotification;
}) => {
  const { group } = notification.frontData;
  const { event, viewed, date, isActionsAvailable, backData, _id } =
    notification;
  const { userIdLogged, usernameLogged } = useUserData();
  const { updateSocketToken } = useSocket();
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
          const socket = await updateSocketToken();
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
        href: `${GROUPS}/${group._id}/solicitudes`,
      });
    }
    optionsList.push({
      label: "Ver Grupo",
      as: Link,
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
          const socket = await updateSocketToken();

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
    <NotificationCard isNew={!viewed}>
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
        date={showDate(parseZonedDateTime(date))}
        items={getNotificationOptionsList()}
      />
    </NotificationCard>
  );
};

export default GroupNotificationCard;
