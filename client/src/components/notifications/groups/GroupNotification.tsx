import { GROUPS } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseDate } from "@internationalized/date";
import Link from "next/link";
import {
  NotificationCard,
  NotificationBody,
  NotificationOptions,
  NotificationOptionProps,
} from "../NotificationCard";

import GroupImage from "./GroupImage";
import { GroupNotification, GroupNotificationType } from "@/types/groupTypes";
import { noticationMessages } from "./notificationMessages";

const GroupNotificationCard = ({
  notification,
}: {
  notification: GroupNotification;
}) => {
  const { group } = notification.frontData;
  const { event } = notification;
  const getNotificationOptionsList = () => {
    const optionsList: NotificationOptionProps[] = [
      
    ]
    const notificationMessage = noticationMessages[event as GroupNotificationType];

    // Check if acceptAction exists before adding it to options
    if (notificationMessage?.acceptAction) {
      optionsList.push({
        label: "Aceptar Solicitud",
        onPress: () => notificationMessage.acceptAction?.(),
      });
    }
    optionsList.push({
      label: "Ver Grupo",
      as: Link,
      className: "text-text-color",
      href: `${GROUPS}/${group._id}`,
    })
    if (notificationMessage?.rejectAction) {
      optionsList.push({
        label: "Rechazar Solicitud",
        color: "danger",
        onPress: () => notificationMessage.rejectAction?.(),
      });
    }
    return optionsList;
  };
  return (
    <NotificationCard>
      <GroupImage group={group} />
      <NotificationBody>
        <p className="text-sm">
          {noticationMessages[event as GroupNotificationType].showUser && (
            <span className="font-semibold">
              {notification.frontData.userInviting.username}
            </span>
          )} {" "}
          {noticationMessages[event as GroupNotificationType].message}
          <span className="font-semibold"> {group.name}</span>
        </p>
      </NotificationBody>
      <NotificationOptions
        date={showDate(parseDate(notification.date))}
        items={getNotificationOptionsList()}
      />
    </NotificationCard>
  );
};

export default GroupNotificationCard;
