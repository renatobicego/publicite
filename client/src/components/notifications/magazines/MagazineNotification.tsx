import { MAGAZINES } from "@/utils/data/urls";
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

import { noticationMessages } from "./notificationMessages";
import { useSocket } from "@/app/socketProvider";
import { MagazineNotification, MagazineNotificationType } from "@/types/magazineTypes";
import { IoBook } from "react-icons/io5";

const MagazineNotificationCard = ({
  notification,
}: {
  notification: MagazineNotification;
}) => {
  const { magazine } = notification.frontData;
  const { event } = notification.notification;
  const { socket } = useSocket();
  const getNotificationOptionsList = () => {
    const optionsList: NotificationOptionProps[] = [];
    const notificationMessage =
      noticationMessages[event as MagazineNotificationType];

    // Check if acceptAction exists before adding it to options
    if (notificationMessage?.acceptAction) {
      optionsList.push({
        label: "Aceptar Solicitud",
        onPress: () => notificationMessage.acceptAction?.(magazine._id),
      });
    }
    optionsList.push({
      label: "Ver Revista",
      as: Link,
      className: "text-text-color",
      href: `${MAGAZINES}/${magazine._id}`,
    });
    if (notificationMessage?.rejectAction) {
      optionsList.push({
        label: "Rechazar Solicitud",
        color: "danger",
        onPress: () => notificationMessage.rejectAction?.(magazine._id, socket),
      });
    }
    return optionsList;
  };
  return (
    <NotificationCard>
      <NotificationImage>
        <IoBook className="text-secondary size-14" />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">
          {noticationMessages[event as MagazineNotificationType].showUser && (
            <span className="font-semibold">
              {notification.frontData.magazine.userInviting.username}
            </span>
          )}{" "}
          {noticationMessages[event as MagazineNotificationType].message}
          <span className="font-semibold"> {magazine.name}</span>
        </p>
      </NotificationBody>
      <NotificationOptions
        date={showDate(parseZonedDateTime(notification.notification.date))}
        items={getNotificationOptionsList()}
      />
    </NotificationCard>
  );
};

export default MagazineNotificationCard;
