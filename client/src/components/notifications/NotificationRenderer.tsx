"use client";

import type React from "react";
import { useMemo } from "react";
import GroupNotificationCard from "./groups/GroupNotification";
import NewContactPost from "./contactSeller/NewContactPost";
import MagazineNotificationCard from "./magazines/MagazineNotification";
import PostActivityNotificationCard from "./postsActivity/PostActivityNotification";
import ReviewRequest from "./postsCalification/PostCalificationNotification";
import ElementShared from "./sharedElements/ElementShared";
import PaymentNotification from "./suscriptions/PaymentNotification";
import UserRelationNotificationCard from "./users/UserRelationNotification";
import SubscriptionDowngradeNotification from "./suscriptions/SubscriptionDowngradeNotification";

type NotificationType =
  | "group"
  | "magazine"
  | "user"
  | "post"
  | "contact"
  | "payment"
  | "calification"
  | "share"
  | "free_trial"
  | "subscription_cancelled"
  | "downgrade_plan";

const notificationComponents = {
  group: GroupNotificationCard,
  magazine: MagazineNotificationCard,
  user: UserRelationNotificationCard,
  post: PostActivityNotificationCard,
  contact: NewContactPost,
  payment: PaymentNotification,
  free_trial: PaymentNotification,
  subscription_cancelled: PaymentNotification,
  downgrade_plan: SubscriptionDowngradeNotification,
  calification: ReviewRequest,
  share: ElementShared,
};

const getNotificationType = (event: string): NotificationType | null => {
  for (const type of Object.keys(
    notificationComponents
  ) as NotificationType[]) {
    if (event.includes(type)) {
      return type;
    }
  }
  return null;
};

interface NotificationRendererProps {
  notifications: BaseNotification[];
}

const NotificationRenderer: React.FC<NotificationRendererProps> = ({
  notifications,
}) => {
  const renderedNotifications = useMemo(() => {
    return notifications.map((notification) => {
      const type = getNotificationType(notification.event);
      if (!type) return null;

      const Component = notificationComponents[type];
      return (
        <Component key={notification._id} notification={notification as any} />
      );
    });
  }, [notifications]);

  return <>{renderedNotifications}</>;
};

export default NotificationRenderer;
