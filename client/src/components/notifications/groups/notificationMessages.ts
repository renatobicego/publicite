import { GroupNotificationType } from "@/types/groupTypes";
import { acceptGroupInvitation, acceptNewMember, declineGroupInvitation, declineNewMember } from "./actions";

export const noticationMessages: Record<
  GroupNotificationType,
  {
    message: string;
    showUser: boolean;
    acceptAction?: Function;
    rejectAction?: Function;
  }
> = {
  notification_group_user_new_admin: {
    message: "te ha asignado administrador del grupo",
    showUser: true,
  },
  notification_group_user_accepted: {
    message: "Has sido aceptado en el grupo",
    showUser: false,
  },
  notification_group_user_rejected: {
    message: "Has sido rechazado en el grupo",
    showUser: false,
  },
  notification_group_new_user_invited: {
    message: "te ha invitado al grupo",
    showUser: true,
    acceptAction: acceptGroupInvitation,
    rejectAction: declineGroupInvitation
  },
  notification_group_user_removed_from_group: {
    message: "Has sido eliminado del grupo",
    showUser: false,
  },
  notification_group_user_request_group_invitation: {
    message: "ha solicitado unirse al grupo",
    showUser: true,
    acceptAction: acceptNewMember,
    rejectAction: declineNewMember
  },
  notification_group_user_rejected_group_invitation: {
    message: "ha rechazado tu solicitud al grupo",
    showUser: true,
  },
  notification_group_new_user_added: {
    message: "te ha agregado al grupo",
    showUser: true,
  },
  notification_group_user_removed_admin: {
    message: "Te han quitado el rol de administrador en el grupo ",
    showUser: false,
  }
};
