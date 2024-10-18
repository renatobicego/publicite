export class GroupInvitation {
  groupInvitation: {
    event: string;
    viewed: boolean;
    backData: {
      userToSendId: string;
      eventNotification: string;
    };
    frontData: {
      group: Pick<any, '_id' | 'name' | 'profilePhotoUrl'>;
      userInviting: Pick<any, 'username'>;
      date: string;
    };
  };
}
