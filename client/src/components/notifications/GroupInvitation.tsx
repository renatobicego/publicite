import { GROUPS } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseDate } from "@internationalized/date";
import { Image } from "@nextui-org/react";
import Link from "next/link";
import {
  NotificationCard,
  NotificationImage,
  NotificationBody,
  NotificationOptions,
} from "./NotificationCard";
import { GroupInvitationNotification } from "@/types/userTypes";

const GroupInvitation = ({
  notification,
}: {
  notification: GroupInvitationNotification;
}) => {
  const { group } = notification;
  return (
    <NotificationCard>
      <NotificationImage>
        <Image
          radius="full"
          src={group.profilePhotoUrl || "/groupLogo.png"}
          alt="foto"
          className="object-cover w-16 h-16"
        />
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">
          <span className="font-semibold">
            {notification.userInviting.username}
          </span>{" "}
          te ha enviado una invitación al grupo
          <span className="font-semibold"> {group.name}</span>
        </p>
      </NotificationBody>
      <NotificationOptions
        date={showDate(parseDate(notification.date))}
        items={[
          {
            label: "Aceptar Solicitud",
          },
          {
            label: "Ver Grupo",
            as: Link,
            className: "text-text-color",
            href: `${GROUPS}/${group._id}`,
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

export default GroupInvitation;
