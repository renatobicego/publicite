export interface Notification {
  event: string;
  viewed: boolean;
  date: string;
  backData: {
    userIdTo: string;
    userIdFrom: string;
  };
}
