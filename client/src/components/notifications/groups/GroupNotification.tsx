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

const GroupNotificationCard = ({
  notification,
}: {
  notification: GroupNotification;
}) => {
  const { group } = notification.frontData;
  const { event, viewed, date, isActionsAvailable } = notification;
  const { updateSocketToken } = useSocket();
  const getNotificationOptionsList = () => {
    const optionsList: NotificationOptionProps[] = [];
    const notificationMessage =
      groupNotificationMessages[event as GroupNotificationType];

    // Check if acceptAction exists before adding it to options
    if (notificationMessage?.acceptAction && isActionsAvailable) {
      optionsList.push({
        label: "Aceptar Solicitud",
        onPress: () => notificationMessage.acceptAction?.(group._id),
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
    if (notificationMessage?.rejectAction && isActionsAvailable) {
      optionsList.push({
        label: "Rechazar Solicitud",
        color: "danger",
        onPress: async () => {
          const socket = await updateSocketToken();

          notificationMessage.rejectAction?.(group._id, socket);
        },
      });
    }
    return optionsList;
  };
  return (
    <NotificationCard isNew={!viewed}>
      <GroupImage group={group} />
      <NotificationBody>
        <p className="text-sm">
          {groupNotificationMessages[event as GroupNotificationType].showUser && (
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
