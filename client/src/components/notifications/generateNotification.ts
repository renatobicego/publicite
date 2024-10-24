import { getLocalTimeZone, now } from "@internationalized/date";

const generateNotification = (event: string, userToSendId: string) => {
  const baseNotification: Omit<BaseNotification, "_id"> = {
    notification: {
      date: now(getLocalTimeZone()).toString(),
      event,
      viewed: false,
      backData: { userToSendId },
    },
  };
  return baseNotification;
};

export default generateNotification;
