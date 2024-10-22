import { Notification } from './notification.entity';

const eventTypes = [
  'notification_group_new_user_invited', // Te han invitado a un grupo
  'notification_group_new_user_added', // Te han agregado a un grupo
  'notification_group_user_accepted', // te han aceptado en un grupo
  'notification_group_user_rejected', // te han rechazado en un grupo
  'notification_group_user_rejected_group_invitation', // usuario B rechazo unirse al grupo
  'notification_group_user_request_group_invitation', // Usuario A quiere pertenecer a grupo
  'notification_group_user_removed_from_group', // te han eliminado del grupo,
  'notification_group_user_new_admin', // te han convertido en administrador
] as const;

type EventTypes = (typeof eventTypes)[number];
const allowedEvents: Set<EventTypes> = new Set(eventTypes);

class GroupInvitation {
  groupInvitation: {
    notification: Notification;
    frontData: {
      group: Pick<any, '_id' | 'name' | 'profilePhotoUrl'>;
      userInviting: Pick<any, 'username'>;
    };
  };
}

export { allowedEvents, EventTypes, GroupInvitation };
