import { DropdownItem, Image, Link } from "@nextui-org/react";
import {
  NotificationBody,
  NotificationCard,
  NotificationImage,
  NotificationOptions,
} from "./NotificationCard";
import { Good, PostNotification } from "@/types/postTypes";
import { POSTS } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseDate } from "@internationalized/date";

const NewContactPost = ({
  notification,
}: {
  notification: PostNotification;
}) => {
  const { post } = notification;
  const { imagesUrls } = post as Good;
  return (
    <NotificationCard>
      <NotificationImage>
        <Image
          radius="sm"
          src={post.postType === "petition" ? "/logo.png" : imagesUrls[0]}
          alt="foto"
          className="object-cover"
          classNames={{
            wrapper: "w-full !max-w-full",
          }}
        />
      </NotificationImage>
      <NotificationBody>{notification.message}</NotificationBody>
      <NotificationOptions
        date={showDate(parseDate(notification.date))}
        items={[
          {
            label: "Ver Solicitud",
          },
          {
            label: "Ver Post",
            as: Link,
            href: `${POSTS}/${post._id}`,
          },
          {
            label: "Rechazar Solicitud",
            color: "danger",
          },
        ]}
      />
    </NotificationCard>
  );
};

export default NewContactPost;
