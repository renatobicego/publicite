import NewContactPost from "@/components/notifications/contactSeller/NewContactPost";
import GroupInvitation from "@/components/notifications/groups/GroupNotification";
import MagazineNotificationCard from "@/components/notifications/magazines/MagazineNotification";
import PostActivityNotificationCard from "@/components/notifications/postsActivity/PostActivityNotification";
import PaymentNotification from "@/components/notifications/suscriptions/PaymentNotification";
import UserRelationNotificationCard from "@/components/notifications/users/UserRelationNotification";
import { GroupNotification } from "@/types/groupTypes";
import { MagazineNotification } from "@/types/magazineTypes";
import {
  ContactSellerNotification,
  PostActivityNotification,
} from "@/types/postTypes";
import { PaymentNotificationType } from "@/types/subscriptions";
import { UserRelationNotification } from "@/types/userTypes";
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
      case notification.event.includes("user"):
        return (
          <UserRelationNotificationCard
            key={notification._id}
            notification={notification as UserRelationNotification}
          />
        );
      case notification.event.includes("post"):
        return (
          <PostActivityNotificationCard
            key={notification._id}
            notification={notification as PostActivityNotification}
          />
        );
      case notification.event.includes("contact"):
        return (
          <NewContactPost
            key={notification._id}
            notification={notification as ContactSellerNotification}
          />
        );
      case notification.event.includes("payment"):
        return (
          <PaymentNotification
            key={notification._id}
            notification={notification as PaymentNotificationType}
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
