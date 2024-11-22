import { DropdownItem, Image, Link, useDisclosure } from "@nextui-org/react";
import {
  NotificationBody,
  NotificationCard,
  NotificationImage,
  NotificationOptions,
} from "../NotificationCard";
import { Good, PostContactNotification } from "@/types/postTypes";
import { FILE_URL, POSTS } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseDate, parseZonedDateTime } from "@internationalized/date";
import ContactPetition from "@/components/modals/ContactPetition/ContactPetition";

const NewContactPost = ({
  notification,
}: {
  notification: PostContactNotification;
}) => {
  const { post } = notification;
  const { imagesUrls } = post as Good;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <NotificationCard isNew>
      <NotificationImage>
        <Image
          radius="sm"
          src={
            post.postType === "petition"
              ? "/logo.png"
              : FILE_URL + imagesUrls[0]
          }
          alt="foto"
          className="object-cover"
          classNames={{
            wrapper: "w-full !max-w-full object-cover",
          }}
        />
      </NotificationImage>
      <NotificationBody>{notification.message}</NotificationBody>
      <NotificationOptions
        date={showDate(parseZonedDateTime(notification.date))}
        items={[
          {
            label: "Ver Solicitud",
            onPress: onOpen,
          },
          {
            label: "Ver Post",
            as: Link,
            href: `${POSTS}/${post._id}`,
            className: "text-text-color",
          },
          {
            label: "Rechazar Solicitud",
            color: "danger",
          },
        ]}
      />
      {isOpen && (
        <ContactPetition
          post={post}
          isOpen={true}
          onOpenChange={onOpenChange}
          notification={notification}
        />
      )}
    </NotificationCard>
  );
};

export default NewContactPost;
