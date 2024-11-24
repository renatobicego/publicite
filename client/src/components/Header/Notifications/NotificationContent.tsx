// import MagazineInvitation from "@/components/notifications/MagazineInvitation";
// import NewContactRequest from "@/components/notifications/NewContactRequest";
// import NewContactPost from "@/components/notifications/posts/NewContactPost";
// import PostShared from "@/components/notifications/posts/PostShared";
// import ReviewRequest from "@/components/notifications/posts/ReviewRequest";
// import PaymentSuccess from "@/components/notifications/suscriptions/PaymentSuccess";
import GroupInvitation from "@/components/notifications/groups/GroupNotification";
import MagazineNotificationCard from "@/components/notifications/magazines/MagazineNotification";
import { GroupNotification } from "@/types/groupTypes";
import { MagazineNotification } from "@/types/magazineTypes";
import { Spinner } from "@nextui-org/react";

const NotificationsContent = ({
  notifications,
  isLoading,
}: {
  notifications: BaseNotification[];
  isLoading: boolean;
}) => {
  const renderNotification = (notification: BaseNotification) => {
    switch (true) {
      case notification.event.includes("group"):
        return (
          <GroupInvitation
            key={notification._id}
            notification={notification as GroupNotification}
          />
        );
      case notification.event.includes("magazine"):
        return (
          <MagazineNotificationCard
            key={notification._id}
            notification={notification as MagazineNotification}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="max-md:mb-4 md:p-2 flex flex-col gap-2 min-w-60 relative">
      {!isLoading && notifications.length === 0 && (
        <p className="text-sm text-light-text">No hay notificaciones nuevas</p>
      )}
      {notifications.map((notification) => renderNotification(notification))}
      {isLoading && (
        <div className="w-full flex justify-center items-center top-0 left-0">
          <Spinner color="warning" />
        </div>
      )}
    </div>
  );
};

export default NotificationsContent;
