export class GroupInvitation {
  groupInvitation: {
    event: string;
    viewed: boolean;
    date: string;
    backData: {
      userToSendId: string;
    };
    frontData: {
      group: Pick<any, '_id' | 'name' | 'profilePhotoUrl'>;
      userInviting: Pick<any, 'username'>;
    };
  };
}
