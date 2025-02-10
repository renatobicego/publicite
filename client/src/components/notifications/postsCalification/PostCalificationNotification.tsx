import { Image, Link, useDisclosure } from "@nextui-org/react";
import {
  NotificationBody,
  NotificationCard,
  NotificationImage,
  NotificationOptions,
} from "../NotificationCard";
import {
  PostCalificationNotification,
  PostCalificationNotificationType,
} from "@/types/postTypes";
import { FILE_URL, POSTS } from "@/utils/data/urls";
import { parseIsoDate, showDate } from "@/utils/functions/dates";
import { parseZonedDateTime } from "@internationalized/date";
import { lazy } from "react";
import { postCalificationNotificationMessages } from "./notificationMessages";
const ReviewPost = lazy(
  () => import("@/components/modals/ReviewModal/ReviewPost")
);

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
    date,
    isActionsAvailable,
    viewed,
  } = notification;
  const { imagesUrls } = post;
  const eventType = event as PostCalificationNotificationType;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const getMessageToShow = () => {
    const notificationMessage = postCalificationNotificationMessages[eventType];
    switch (eventType) {
      case "notification_new_calification_request":
        return (
          <p className="text-sm text-text-color">
            {notificationMessage.message}
            <span className="font-semibold"> {post.title}</span>.
          </p>
        );

      case "notification_new_calification_response":
        return (
          <p className="text-sm text-text-color">
            {notificationMessage.message}
            <span className="font-semibold"> {post.title}</span>.
          </p>
        );

      default:
        return <>{notificationMessage.message}</>;
    }
  };

  const getOptionsList = () => {
    const optionsList = [];

    if (
      eventType === "notification_new_calification_request" &&
      isActionsAvailable
    ) {
      optionsList.push({
        label: "Calificar Anuncio",
        onPress: onOpen,
      });
    } else if (eventType === "notification_new_calification_response") {
      optionsList.push({
        label: "Ver Calificación",
        as: Link,
        href: `${POSTS}/${post._id}#opiniones`,
        className: "text-text-color",
      });
    }
    optionsList.push({
      label: "Ver Post",
      as: Link,
      href: `${POSTS}/${post._id}`,
      className: "text-text-color",
    });
    return optionsList;
  };

  return (
    <>
      <NotificationCard isNew={!viewed}>
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
          date={showDate(parseIsoDate(date))}
          items={getOptionsList()}
        />
      </NotificationCard>
      {eventType === "notification_new_calification_request" && (
        <ReviewPost
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          notification={notification}
        />
      )}
    </>
  );
};

export default ReviewRequest;
