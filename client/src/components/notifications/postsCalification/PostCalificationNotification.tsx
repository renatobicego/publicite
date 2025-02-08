import { Image, Link, useDisclosure } from "@nextui-org/react";
import {
  NotificationBody,
  NotificationCard,
  NotificationImage,
  NotificationOptions,
} from "../NotificationCard";
import {
  Good,
  PostCalificationNotification,
  PostCalificationNotificationType,
  ReviewPostNotification,
} from "@/types/postTypes";
import { FILE_URL, POSTS } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseDate, parseZonedDateTime } from "@internationalized/date";
import ReviewPost from "@/components/modals/ReviewModal/ReviewPost";
import { postCalificationNotificationMessages } from "./notificationMessages";

const ReviewRequest = ({
  notification,
}: {
  notification: PostCalificationNotification;
}) => {
  const {
    frontData: {
      postCalification: { post },
    },
    event,
  } = notification;
  const { imagesUrls } = post;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const getMessageToShow = () => {
    const notificationMessage =
      postCalificationNotificationMessages[
        event as PostCalificationNotificationType
      ];
    switch (event as PostCalificationNotificationType) {
      case "notification_new_calification_request":
        return (
          <p className="text-sm text-text-color">
            Compartí tu opinión sobre
            <span className="font-semibold"> {post.title}</span>.
          </p>
        );

      case "notification_new_calification_response":
        return (
          <p className="text-sm text-text-color">
            Has recibido una nueva calificación sobre
            <span className="font-semibold"> {post.title}</span>.
          </p>
        );

      default:
        return <>{notificationMessage.message}</>;
    }
  };

  return (
    <NotificationCard isNew>
      <NotificationImage>
        <Image
          radius="sm"
          src={FILE_URL + imagesUrls[0]}
          alt="foto"
          className="object-cover"
          classNames={{
            wrapper: "w-full !max-w-full object-cover",
          }}
        />
      </NotificationImage>
      <NotificationBody>{getMessageToShow()}</NotificationBody>
      <NotificationOptions
        date={showDate(parseZonedDateTime(notification.date))}
        items={[
          {
            label: "Calificar Anuncio",
            onPress: onOpen,
          },
          {
            label: "Ver Post",
            as: Link,
            href: `${POSTS}/${post._id}`,
            className: "text-text-color",
          },
        ]}
      />
    </NotificationCard>
  );
};

export default ReviewRequest;
