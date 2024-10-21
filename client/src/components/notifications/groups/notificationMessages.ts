import { GroupNotificationType } from "@/types/groupTypes";

export const noticationMessages: Record<
  GroupNotificationType,
  { message: string; showUser: boolean }
> = {
  notification_group_user_new_admin: {
    message: "te ha asignado administrador del grupo",
    showUser: true,
  },
  notification_group_user_added: {
    message: "Has sido aceptado en el grupo",
    showUser: false,
  },
  notification_group_user_request_rejected: {
    message: "Has sido rechazado en el grupo",
    showUser: false,
  },
  notification_group_user_request_sent: {
    message: "te ha invitado al grupo",
    showUser: true,
  },
  notification_group_user_delete: {
    message: "Has sido eliminado del grupo",
    showUser: false,
  },
  notification_group_user_invite_declined: {
    message: "ha solicitado unirse al grupo",
    showUser: true,
  },
};
