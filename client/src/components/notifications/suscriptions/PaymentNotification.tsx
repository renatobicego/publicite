import {
  NotificationBody,
  NotificationCard,
  NotificationImage,
} from "../NotificationCard";
import {
  PaymentNotificationType,
  PaymentStatusNotificationType,
} from "@/types/subscriptions";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { paymentNotificationMessages } from "./notificationMessages";

const PaymentNotification = ({
  notification,
}: {
  notification: PaymentNotificationType;
}) => {
  const {
    frontData: {
      subscriptionPlan: { reason, retryAttemp },
    },
    event,
    viewed,
  } = notification;

  const messageToShow =
    paymentNotificationMessages[event as PaymentStatusNotificationType];

  return (
    <NotificationCard isNew={!viewed} id={notification._id}>
      <NotificationImage>
        <FaFileInvoiceDollar className="text-success size-10" />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">
          {messageToShow.message}
          <span className="font-semibold"> {reason}</span>
          {messageToShow.attemptMessage
            ? `${messageToShow.attemptMessage}${retryAttemp}/4. ${
                retryAttemp < 4 && "Haremos un nuevo intento próximanente."
              } `
            : "."}
          {messageToShow.endMessage && messageToShow.endMessage}
        </p>
      </NotificationBody>
    </NotificationCard>
  );
};
export default PaymentNotification;
