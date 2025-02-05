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
  } = notification;

  const messageToShow =
    paymentNotificationMessages[event as PaymentStatusNotificationType];

  return (
    <NotificationCard isNew>
      <NotificationImage>
        <FaFileInvoiceDollar className="text-success size-10" />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">
          {messageToShow.message}
          <span className="font-semibold"> {reason}</span>
          {messageToShow.attemptMessage
            ? `${messageToShow.attemptMessage}${retryAttemp}.`
            : "."}
          {messageToShow.endMessage && messageToShow.endMessage}
        </p>
      </NotificationBody>
    </NotificationCard>
  );
};
export default PaymentNotification;
