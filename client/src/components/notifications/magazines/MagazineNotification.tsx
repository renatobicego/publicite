import { MAGAZINES } from "@/utils/data/urls";
import { parseIsoDate, showDate } from "@/utils/functions/dates";
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
import { checkAndAddDeleteNotification } from "../deleteNotification";
import { useNotificationsContext } from "@/app/(root)/providers/notificationsProvider";
import { useState } from "react";
import { Link } from "@nextui-org/react";
import { useNotificationsIsOpen } from "@/components/Header/Notifications/notificationsOptionsProvider";

const MagazineNotificationCard = ({
  notification,
}: {
  notification: MagazineNotification;
}) => {
  const { setIsOpen } = useNotificationsIsOpen();
  const { magazine } = notification.frontData;
  const { event, backData, viewed, date, isActionsAvailable, _id } =
    notification;
  const { userIdLogged, usernameLogged } = useUserData();
  const { socket } = useSocket();
  const [isActionSent, setIsActionSent] = useState(false);
  const { deleteNotification } = useNotificationsContext();
  const getNotificationOptionsList = () => {
    const optionsList: NotificationOptionProps[] = [];
    const notificationMessage =
      magazineNotificationMessages[event as MagazineNotificationType];

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
          setIsActionSent(true);
        },
      });
    }
    optionsList.push({
      label: "Ver Revista",
      as: Link,
      color: "default",
      onClick: () => setIsOpen(false),
      className: "text-text-color",
      href: `${MAGAZINES}/${magazine._id}`,
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
          setIsActionSent(true);
        },
      });
    }
    checkAndAddDeleteNotification(optionsList, event, _id, deleteNotification);

    return optionsList;
  };
  return (
    <NotificationCard isNew={!viewed} id={_id}>
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
        date={showDate(parseIsoDate(date))}
        items={getNotificationOptionsList()}
      />
    </NotificationCard>
  );
};

export default MagazineNotificationCard;
