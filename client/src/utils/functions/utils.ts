import { Subscription, SubscriptionPlan } from "@/types/subscriptions";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";

export const checkIfUserIsSubscribed = (
  subscriptionsOfUser: Subscription[],
  subscriptionPlan: SubscriptionPlan | string,
  byMpId?: boolean
) => {
  return subscriptionsOfUser.some((subscription) => {
    const isSameId = byMpId
      ? subscription.subscriptionPlan.mpPreapprovalPlanId == subscriptionPlan
      : subscription.subscriptionPlan._id ==
        (subscriptionPlan as SubscriptionPlan)._id;
    if (isSameId) {
      const todayDate = today(getLocalTimeZone());
      switch (true) {
        case subscription.status === "active":
          return true;
        // if the subscription has been cancelled but it's still within 3 days of its end date
        case subscription.status === "cancelled" &&
          todayDate.add({ days: 3 }).compare(parseDate(subscription.endDate)) >
            0:
          return true;
        default:
          return false;
      }
    }
    return false;
  });
};

export const getMagazineType = (options?: string[]) => {
  if(!options) return { isGroupMagazine: false, isSharedMagazine: false };
  const isGroupMagazine = options.includes("grupos");
  const isSharedMagazine = options.includes("compartida");
  return { isGroupMagazine, isSharedMagazine };
};

export const getId = (options: string[] | undefined, isGroupMagazine: boolean) => {
  if(!options) return null;
  return isGroupMagazine ? options[1] : options[0] || null;
};

export const getSharedMagazineIds = (
  options: string[] | undefined,
  isSharedMagazine: boolean
) => {
  if(!options) return null;
  return isSharedMagazine ? { user: options[1], post: options[2] } : null;
};

export const handleBoardColor = (bg: string) => {
  const darkColors = ["bg-[#5A0001]/80"];
  const darkColorsBorder = [
    "bg-[#5A0001]/80",
    "bg-[#20A4F3]/30",
    "bg-[#FFB238]/80",
  ];
  const textColor = darkColors.includes(bg) ? "text-white" : "text-text-color";
  const borderColor = darkColorsBorder.includes(bg) ? "border-white" : "";
  return { textColor, borderColor };
};

const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"]; // Add more as needed

// Helper function to check if the URL is a video based on file extension
export const isVideo = (url: string) => {
  const extension = url.split(".").pop()?.toLowerCase();
  return extension ? videoExtensions.includes(extension) : false;
};
