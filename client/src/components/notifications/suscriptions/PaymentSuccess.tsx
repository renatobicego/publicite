import { CONFIGURATION, MAGAZINES } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseDate } from "@internationalized/date";
import { IoBook } from "react-icons/io5";
import {
  NotificationBody,
  NotificationCard,
  NotificationImage,
  NotificationOptions,
} from "../NotificationCard";
import { Link } from "@nextui-org/react";
import { PaymentSuccesNotification } from "@/types/subscriptions";
import { FaFileInvoiceDollar } from "react-icons/fa6";

const PaymentSuccess = ({
  notification,
}: {
  notification: PaymentSuccesNotification;
}) => {
  return (
    <NotificationCard>
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
      <NotificationOptions
        date={showDate(parseDate(notification.date))}
        items={[
          {
            label: "Gestionar Suscripción",
            as: Link,
            className: "text-text-color",
            href: `${CONFIGURATION}/suscripcion`,
          },
        ]}
      />
    </NotificationCard>
  );
};
export default PaymentSuccess;
