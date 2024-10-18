const eventTypes = [
  'notification_group_ivitation',
  'notification_group_user_delete',
  'notification_group_user_added',
  'notification_group_user_request_rejected',
  'notification_group_user_invite_declined',
  'notification_group_user_request_sent',
  'notification_group_user_new_admin',
] as const;

type EventTypes = (typeof eventTypes)[number];
const allowedEvents: Set<EventTypes> = new Set(eventTypes);

class GroupInvitation {
  groupInvitation: {
    event: EventTypes;
    viewed: boolean;
    date: string;
    backData: {
      userToSendId: string;
    };
    frontData: {
      group: Pick<any, '_id' | 'name' | 'profilePhotoUrl'>;
      userInviting: Pick<any, 'username'>;
    };
    type: string;
  };
}

export { allowedEvents, EventTypes, GroupInvitation };
