import { showDate } from "@/utils/functions/dates";
import { parseDate } from "@internationalized/date";
import {
  NotificationBody,
  NotificationCard,
  NotificationImage,
  NotificationOptions,
} from "../NotificationCard";
import { PaymentSuccesNotification } from "@/types/subscriptions";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { useClerk } from "@clerk/nextjs";

const PaymentSuccess = ({
  notification,
}: {
  notification: PaymentSuccesNotification;
  }) => {
  return (
    <NotificationCard isNew>
      <NotificationImage>
        <FaFileInvoiceDollar className="text-success size-10" />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">
          ¡Gracias! Hemos recibido tu pago por la suscripción a
          <span className="font-semibold">
            {" "}
            {notification.subscriptionPlan.reason}
          </span>
        </p>
      </NotificationBody>
    </NotificationCard>
  );
};
export default PaymentSuccess;
