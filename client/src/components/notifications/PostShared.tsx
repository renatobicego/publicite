import { CREATE_MAGAZINE, POSTS } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseDate } from "@internationalized/date";
import { Image } from "@nextui-org/react";
import Link from "next/link";
import {
  NotificationCard,
  NotificationImage,
  NotificationBody,
  NotificationOptions,
} from "./NotificationCard";
import { Good, PostSharedNotification } from "@/types/postTypes";
import { MdQuestionAnswer } from "react-icons/md";

const PostShared = ({
  notification,
}: {
  notification: PostSharedNotification;
}) => {
  const { post } = notification;
  return (
    <NotificationCard>
      <NotificationImage>
        {post.postType === "petition" ? (
          <MdQuestionAnswer className="text-petition size-20" />
        ) : (
          <Image
            radius="sm"
            src={(post as Good).imagesUrls[0]}
            alt="foto"
            className="object-cover"
            classNames={{
              wrapper: "w-full !max-w-full",
            }}
          />
        )}
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm">
          <span className="font-semibold">
            {notification.userSharing.username}
          </span>{" "}
          te ha compartido una publicación.
        </p>
      </NotificationBody>
      <NotificationOptions
        date={showDate(parseDate(notification.date))}
        items={[
          {
            label: "Ver Publicación",
            as: Link,
            className: "text-text-color",
            href: `${POSTS}/${post._id}`,
          },
          {
            label: "Crear Revista Compartida",
            as: Link,
            className: "text-text-color",
            href: `${CREATE_MAGAZINE}/compartida/${notification.userSharing._id}/${post._id}`,
          },
        ]}
      />
    </NotificationCard>
  );
};

export default PostShared;
