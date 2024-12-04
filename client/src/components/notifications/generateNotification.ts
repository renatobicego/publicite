import { getLocalTimeZone, now } from "@internationalized/date";

const generateNotification = (
  event: string,
  userIdTo: string,
  userIdFrom: string,
  previousNotificationId: string | null
) => {
  const baseNotification: Omit<BaseNotification, "_id"> = {
    date: now(getLocalTimeZone()).toString(),
    event,
    viewed: false,
    backData: { userIdTo, userIdFrom },
    isActionsAvailable: true,
    previousNotificationId,
  };
  return baseNotification;
};

export default generateNotification;
