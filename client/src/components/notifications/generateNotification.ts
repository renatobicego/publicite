import { getLocalTimeZone, now } from "@internationalized/date";

const generateNotification = (event: string) => {
  const baseNotification: BaseNotification = {
    date: now(getLocalTimeZone()).toString(),
    event,
    viewed: false,
  };
  return baseNotification;
};

export default generateNotification;