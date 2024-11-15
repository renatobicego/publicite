import { MagazineNotificationType } from "@/types/magazineTypes";

export const noticationMessages: Record<
  MagazineNotificationType,
  {
    message: string;
    showUser: boolean;
    acceptAction?: Function;
    rejectAction?: Function;
  }
> = {
  notification_magazine_new_user_invited: {
    // Usuario A invita a Usuario B a colaborar en una revista: {
    message: "te ha invitado a colaborar en la revista ",
    showUser: true,
    acceptAction: () => { },
    rejectAction: () => { },
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
  }
};
