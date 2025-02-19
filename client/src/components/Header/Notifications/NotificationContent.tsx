import NewContactPost from "@/components/notifications/contactSeller/NewContactPost";
import GroupInvitation from "@/components/notifications/groups/GroupNotification";
import MagazineNotificationCard from "@/components/notifications/magazines/MagazineNotification";
import NotificationRenderer from "@/components/notifications/NotificationRenderer";
import PostActivityNotificationCard from "@/components/notifications/postsActivity/PostActivityNotification";
import ReviewRequest from "@/components/notifications/postsCalification/PostCalificationNotification";
import ElementShared from "@/components/notifications/sharedElements/ElementShared";
import PaymentNotification from "@/components/notifications/suscriptions/PaymentNotification";
import UserRelationNotificationCard from "@/components/notifications/users/UserRelationNotification";
import { GroupNotification } from "@/types/groupTypes";
import { MagazineNotification } from "@/types/magazineTypes";
import {
  ContactSellerNotification,
  PostActivityNotification,
  PostCalificationNotification,
} from "@/types/postTypes";
import { PaymentNotificationType } from "@/types/subscriptions";
import {
  ElementSharedNotification,
  UserRelationNotification,
} from "@/types/userTypes";
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
      case notification.event.includes("calification"):
        return (
          <ReviewRequest
            key={notification._id}
            notification={notification as PostCalificationNotification}
          />
        );
      case notification.event.includes("share"):
        return (
          <ElementShared
            key={notification._id}
            notification={notification as ElementSharedNotification}
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
      <NotificationRenderer notifications={notifications} />
      {isLoading && (
        <div className="w-full flex justify-center items-center top-0 left-0">
          <Spinner color="warning" />
        </div>
      )}
    </div>
  );
};

export default NotificationsContent;
