import { Image, Link, useDisclosure } from "@nextui-org/react";
import {
  NotificationBody,
  NotificationCard,
  NotificationImage,
  NotificationOptions,
} from "../NotificationCard";
import { Good, ReviewPostNotification } from "@/types/postTypes";
import { FILE_URL, POSTS } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseDate, parseZonedDateTime } from "@internationalized/date";
import ReviewPost from "@/components/modals/ReviewModal/ReviewPost";

const ReviewRequest = ({
  notification,
}: {
  notification: ReviewPostNotification;
}) => {
  const { post } = notification;
  const { imagesUrls } = post as Good;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <NotificationCard>
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
      <NotificationBody>
        <p className="text-sm text-text-color">
          <span className="font-semibold">
            {notification.userAsking.username}
          </span>{" "}
          te ha solicitado una calificación de
          <span className="font-semibold"> {post.title}</span>.
        </p>
      </NotificationBody>
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
      <ReviewPost
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        notification={notification}
      />
    </NotificationCard>
  );
};

export default ReviewRequest;
