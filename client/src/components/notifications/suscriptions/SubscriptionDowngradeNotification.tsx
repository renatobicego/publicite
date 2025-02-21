import {
  SubscriptionEvent,
  SubscriptionNotification,
} from "@/types/subscriptions";
import React from "react";
import { subscriptionNotificationMessages } from "./notificationMessages";
import { FaFileInvoiceDollar } from "react-icons/fa";
import {
  NotificationCard,
  NotificationImage,
  NotificationBody,
} from "../NotificationCard";
import { Link } from "@nextui-org/react";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { PROFILE } from "@/utils/data/urls";

const SubscriptionDowngradeNotification = ({
  notification,
}: {
  notification: SubscriptionNotification;
}) => {
  const { event, viewed } = notification;

  const eventParsed = event as SubscriptionEvent;
  const messageToShow = subscriptionNotificationMessages[eventParsed];
  const { usernameLogged } = useUserData();

  const getLinkToTakeAction = () => {
    switch (eventParsed) {
      case "notification_downgrade_plan_contact":
        return (
          <Link size="sm" href={`${PROFILE}/${usernameLogged}/contactos`}>
            {" "}
            Perfil - Contactos - Activos
          </Link>
        );
      case "notification_downgrade_plan_post":
        return (
          <Link size="sm" href={`${PROFILE}/${usernameLogged}`}>
            Perfil - Anuncios - Inactivos
          </Link>
        );
      default:
        return "";
    }
  };

  return (
    <NotificationCard isNew={!viewed}>
      <NotificationImage>
        <FaFileInvoiceDollar className="text-success size-10" />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">
          {messageToShow.message}
          {getLinkToTakeAction()}
        </p>
      </NotificationBody>
    </NotificationCard>
  );
};

export default SubscriptionDowngradeNotification;
