import { getLocalTimeZone, now } from "@internationalized/date";

const generateNotification = (
  event: string,
  userIdTo: string,
  userIdFrom: string
) => {
  const baseNotification: Omit<BaseNotification, "_id"> = {
    notification: {
      date: now(getLocalTimeZone()).toString(),
      event,
      viewed: false,
      backData: { userIdTo, userIdFrom },
    },
  };
  return baseNotification;
};

export default generateNotification;
