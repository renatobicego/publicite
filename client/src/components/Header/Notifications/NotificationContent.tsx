import MagazineInvitation from "@/components/notifications/MagazineInvitation";
import NewContactRequest from "@/components/notifications/NewContactRequest";
import NewContactPost from "@/components/notifications/posts/NewContactPost";
import PostShared from "@/components/notifications/posts/PostShared";
import ReviewRequest from "@/components/notifications/posts/ReviewRequest";
import PaymentSuccess from "@/components/notifications/suscriptions/PaymentSuccess";
import GroupInvitation from "@/components/notifications/groups/GroupNotification";
import { GroupNotification } from "@/types/groupTypes";

const NotificationsContent = ({
  notifications,
}: {
  notifications: BaseNotification[];
}) => {
  const renderNotification = (notification: BaseNotification) => {
    switch (true) {
      case notification.event.includes("group"):
        return (
          <GroupInvitation notification={notification as GroupNotification} />
        );
      default:
        return null;
    }
  };
  return (
    <div className="max-md:mb-4 md:p-2 flex flex-col gap-2 min-w-60">
      {notifications.map((notification) => renderNotification(notification))}
    </div>
  );
};

export default NotificationsContent;
