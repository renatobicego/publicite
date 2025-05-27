import { MagazineNotificationType } from "@/types/magazineTypes";
import { acceptMagazineInvitation, declineMagazineInvitation } from "./actions";

export const notificationMagazineBaseMessages: Record<
  MagazineNotificationType,
  {
    message: string;
    showUser: boolean;
  }
> = {
  notification_magazine_new_user_invited: {
    message: "te ha invitado a colaborar en la revista ",
    showUser: true,
  },
  notification_magazine_acepted: {
    message: "ha aceptado colaborar en la revista ",
    showUser: true,
  },
  notification_magazine_rejected: {
    message: "ha rechazado colaborar en la revista ",
    showUser: true,
  },
  notification_magazine_user_has_been_removed: {
    message: "Has sido eliminado como colaborador de la revista ",
    showUser: false,
  },
};
export const magazineNotificationMessages: Record<
  MagazineNotificationType,
  {
    message: string;
    showUser: boolean;
    acceptAction?: Function;
    rejectAction?: Function;
  }
> = {
  ...notificationMagazineBaseMessages,
  notification_magazine_new_user_invited: {
    ...notificationMagazineBaseMessages.notification_magazine_new_user_invited,
    acceptAction: acceptMagazineInvitation,
    rejectAction: declineMagazineInvitation,
  },
  notification_magazine_acepted: {
    ...notificationMagazineBaseMessages.notification_magazine_acepted,
  },
  notification_magazine_rejected: {
    ...notificationMagazineBaseMessages.notification_magazine_rejected,
  },
  notification_magazine_user_has_been_removed: {
    ...notificationMagazineBaseMessages.notification_magazine_user_has_been_removed,
  },
};
