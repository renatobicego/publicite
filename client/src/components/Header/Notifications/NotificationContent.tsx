// import MagazineInvitation from "@/components/notifications/MagazineInvitation";
// import NewContactRequest from "@/components/notifications/NewContactRequest";
// import NewContactPost from "@/components/notifications/posts/NewContactPost";
// import PostShared from "@/components/notifications/posts/PostShared";
// import ReviewRequest from "@/components/notifications/posts/ReviewRequest";
// import PaymentSuccess from "@/components/notifications/suscriptions/PaymentSuccess";
import GroupInvitation from "@/components/notifications/groups/GroupNotification";
import { GroupNotification } from "@/types/groupTypes";
import { Spinner } from "@nextui-org/react";

const NotificationsContent = ({
  notifications,
  isLoading,
}: {
  notifications: BaseNotification[];
  isLoading: boolean;
}) => {
  const renderNotification = (notification: BaseNotification) => {
    const { notification: notificationData } = notification;
    switch (true) {
      case notificationData.event.includes("group"):
        return (
          <GroupInvitation
            key={notification._id}
            notification={notification as GroupNotification}
          />
        );
      default:
        return null;
    }
  };
  if (isLoading)
    return (
      <div className="max-md:mb-4 md:p-2 flex flex-col gap-2 min-w-60">
        <Spinner color="warning" />
      </div>
    );
  return (
    <div className="max-md:mb-4 md:p-2 flex flex-col gap-2 min-w-60">
      {notifications.length === 0 && (
        <p className="text-sm text-light-text">No hay notificaciones nuevas</p>
      )}
      {notifications.map((notification) => renderNotification(notification))}
    </div>
  );
};

export default NotificationsContent;
