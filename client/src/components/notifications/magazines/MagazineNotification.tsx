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

import { magazineNotificationMessages } from "./notificationMessages";
import { useSocket } from "@/app/socketProvider";
import {
  MagazineNotification,
  MagazineNotificationType,
} from "@/types/magazineTypes";
import { IoBook } from "react-icons/io5";
import { useUserData } from "@/app/(root)/providers/userDataProvider";

const MagazineNotificationCard = ({
  notification,
}: {
  notification: MagazineNotification;
}) => {
  const { magazine } = notification.frontData;
  const { event, backData, viewed, date, isActionsAvailable, _id } = notification;
  const { userIdLogged, usernameLogged } = useUserData();
  const { updateSocketToken } = useSocket();
  const getNotificationOptionsList = () => {
    const optionsList: NotificationOptionProps[] = [];
    const notificationMessage =
      magazineNotificationMessages[event as MagazineNotificationType];

    // Check if acceptAction exists before adding it to options
    if (notificationMessage?.acceptAction && isActionsAvailable) {
      optionsList.push({
        label: "Aceptar Solicitud",
        onPress: async () => {
          const socket = await updateSocketToken();
          notificationMessage.acceptAction?.(
            socket,
            {
              _id: magazine._id,
              name: magazine.name,
              ownerType: magazine.ownerType,
            },
            {
              _id: userIdLogged,
              username: usernameLogged,
            },
            backData.userIdFrom,
            _id
          );
        },
      });
    }
    optionsList.push({
      label: "Ver Revista",
      as: Link,
      className: "text-text-color",
      href: `${MAGAZINES}/${magazine._id}`,
    });
    if (notificationMessage?.rejectAction && isActionsAvailable) {
      optionsList.push({
        label: "Rechazar Solicitud",
        color: "danger",
        onPress: async () => {
          const socket = await updateSocketToken();

          notificationMessage.rejectAction?.(
            socket,
            {
              _id: magazine._id,
              name: magazine.name,
              ownerType: magazine.ownerType,
            },
            {
              _id: userIdLogged,
              username: usernameLogged,
            },
            backData.userIdFrom,
            _id
          );
        },
      });
    }
    return optionsList;
  };
  return (
    <NotificationCard isNew={!viewed}>
      <NotificationImage>
        <IoBook className="text-secondary size-14" />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">
          {magazineNotificationMessages[event as MagazineNotificationType]
            .showUser && (
            <span className="font-semibold">
              {notification.frontData.magazine.userInviting.username}
            </span>
          )}{" "}
          {
            magazineNotificationMessages[event as MagazineNotificationType]
              .message
          }
          <span className="font-semibold"> {magazine.name}</span>
        </p>
      </NotificationBody>
      <NotificationOptions
        date={showDate(parseZonedDateTime(date))}
        items={getNotificationOptionsList()}
      />
    </NotificationCard>
  );
};

export default MagazineNotificationCard;
