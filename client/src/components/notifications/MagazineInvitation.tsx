import { MAGAZINES } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseDate, parseZonedDateTime } from "@internationalized/date";
import Link from "next/link";
import { NotificationCard, NotificationImage, NotificationBody, NotificationOptions } from "./NotificationCard";
import { IoBook } from "react-icons/io5";
import { MagazineInvitationNotification } from "@/types/magazineTypes";

const MagazineInvitation = ({
  notification,
}: {
  notification: MagazineInvitationNotification;
}) => {
  return (
    <NotificationCard>
      <NotificationImage>
        <IoBook className="text-secondary size-14" />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">
          <span className="font-semibold">
            {notification.userInviting.username}
          </span>{" "}
          te ha invitado a colaborar en la revista 
          <span className="font-semibold"> {notification.magazine.name}</span>
        </p>
      </NotificationBody>
      <NotificationOptions
        date={showDate(parseZonedDateTime(notification.date))}
        items={[
          {
            label: "Aceptar Invitación",
          },
          {
            label: "Ver Revista",
            as: Link,
            className: "text-text-color",
            href: `${MAGAZINES}/${notification.magazine._id}`,
          },
          {
            label: "Rechazar Solicitud",
            color: "danger",
          },
        ]}
      />
    </NotificationCard>
  );
};

export default MagazineInvitation;
