import { Image, Link, useDisclosure } from "@nextui-org/react";
import {
  NotificationBody,
  NotificationCard,
  NotificationImage,
  NotificationOptions,
} from "../NotificationCard";
import { ContactSellerNotification } from "@/types/postTypes";
import { FILE_URL, POSTS } from "@/utils/data/urls";
import { parseIsoDate, showDate } from "@/utils/functions/dates";
import { parseZonedDateTime } from "@internationalized/date";
import { lazy } from "react";
const ContactPetition = lazy(
  () => import("@/components/modals/ContactPetition/ContactPetition")
);

const NewContactPost = ({
  notification,
}: {
  notification: ContactSellerNotification;
}) => {
  const {
    frontData: {
      contactSeller: { post, client },
    },
  } = notification;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const messageToDisplay = `${client.name} ${client.lastName} te ha contactado por el anuncio de "${post.title}".`;
  return (
    <NotificationCard isNew>
      <NotificationImage>
        <Image
          radius="sm"
          src={
            "imagesUrls" in post && post.imagesUrls
              ? FILE_URL + post.imagesUrls[0]
              : "/logo.png"
          }
          alt="foto"
          className="object-cover"
          classNames={{
            wrapper: "w-full !max-w-full object-cover",
          }}
        />
      </NotificationImage>
      <NotificationBody>{messageToDisplay}</NotificationBody>
      <NotificationOptions
        date={showDate(parseIsoDate(notification.date))}
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
        ]}
      />
      {isOpen && (
        <ContactPetition
          isOpen={true}
          onOpenChange={onOpenChange}
          notification={notification}
        />
      )}
    </NotificationCard>
  );
};

export default NewContactPost;
