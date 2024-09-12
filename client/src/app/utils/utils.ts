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
