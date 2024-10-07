import { GROUPS } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseDate } from "@internationalized/date";
import Link from "next/link";
import {
  NotificationCard,
  NotificationBody,
  NotificationOptions,
} from "../NotificationCard";
import {
  GroupInvitationNotification,
  GroupNotificationType,
} from "@/types/userTypes";
import GroupImage from "./GroupImage";

const noticationMessages: Record<
  GroupNotificationType,
  { message: string; showUser: boolean }
> = {
  admin: {
    message: "te ha asignado administrador del grupo",
    showUser: true,
  },
  groupAccepted: {
    message: "Has sido aceptado en el grupo",
    showUser: false,
  },
  groupDeclined: {
    message: "Has sido rechazado en el grupo",
    showUser: false,
  },
  groupInvitation: {
    message: "te ha invitado al grupo",
    showUser: true,
  },
  memberDeleted: {
    message: "Has sido eliminado del grupo",
    showUser: false,
  },
  newMemberRequest: {
    message: "ha solicitado unirse al grupo",
    showUser: true,
  },
};

const GroupNotification = ({
  notification,
}: {
  notification: GroupInvitationNotification;
}) => {
  const { group } = notification;
  const { type } = notification;
  return (
    <NotificationCard>
      <GroupImage group={group} />
      <NotificationBody>
        <p className="text-sm">
          {noticationMessages[type].showUser && (
            <span className="font-semibold">
              {notification.userInviting.username}
            </span>
          )} {" "}
          {noticationMessages[type].message}
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

export default GroupNotification;
