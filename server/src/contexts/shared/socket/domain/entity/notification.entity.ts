export interface Notification {
  event: string;
  viewed: boolean;
  date: string;
  backData: {
    userToSendId: string;
  };
}
