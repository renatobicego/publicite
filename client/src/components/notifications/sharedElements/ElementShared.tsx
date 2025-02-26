import {
  CREATE_MAGAZINE,
  FILE_URL,
  GROUPS,
  MAGAZINES,
  POSTS,
  PROFILE,
} from "@/utils/data/urls";
import { parseIsoDate, showDate } from "@/utils/functions/dates";
import { Image, Link } from "@nextui-org/react";
import {
  NotificationCard,
  NotificationImage,
  NotificationBody,
  NotificationOptions,
} from "../NotificationCard";
import { ElementSharedNotification, ShareTypesEnum } from "@/types/userTypes";
import { FaShareAlt } from "react-icons/fa";

const ElementShared = ({
  notification,
}: {
  notification: ElementSharedNotification;
}) => {
  const {
    frontData: {
      share: { _id, description, username, type, imageUrl },
    },
    viewed,
    backData: { userIdFrom },
  } = notification;

  const typeToShow: Record<ShareTypesEnum, string> = {
    group: "el grupo",
    post: "el anuncio",
    magazine: "la revista",
    user: "el perfil",
  };

  const getOptions = () => {
    const options = [];
    switch (type) {
      case "group":
        options.push({
          label: "Ver Grupo",
          as: Link,
          color: "default",
          target: "_blank",
          className: "text-text-color",
          href: `${GROUPS}/${_id}`,
        });
      case "magazine":
        options.push({
          label: "Ver Revista",
          as: Link,
          color: "default",
          target: "_blank",
          className: "text-text-color",
          href: `${MAGAZINES}/${_id}`,
        });
      case "post":
        options.push({
          label: "Ver Anuncio",
          as: Link,
          color: "default",
          target: "_blank",
          className: "text-text-color",
          href: `${POSTS}/${_id}`,
        });
        options.push({
          label: "Crear Revista Compartida",
          as: Link,
          color: "default",
          target: "_blank",
          className: "text-text-color",
          href: `${CREATE_MAGAZINE}/compartida/${userIdFrom}/${_id}`,
        });
      case "user":
        options.push({
          label: "Ver Perfil",
          as: Link,
          color: "default",
          target: "_blank",
          className: "text-text-color",
          href: `${PROFILE}/${_id}`,
        });
        return options;
    }
  };
  return (
    <NotificationCard isNew={!viewed}>
      <NotificationImage>
        {imageUrl ? (
          <Image
            radius="sm"
            src={FILE_URL + imageUrl}
            alt={"foto de portada de" + description}
            removeWrapper
            className="object-cover w-full h-full"
          />
        ) : (
          <FaShareAlt className="text-petition size-10" />
        )}
      </NotificationImage>
      <NotificationBody>
        <p className="text-sm text-text-color">
          <span className="font-semibold">{username}</span> te ha compartido{" "}
          {typeToShow[type]}
          <span className="font-semibold"> {description}</span>.
        </p>
      </NotificationBody>
      <NotificationOptions
        date={showDate(parseIsoDate(notification.date))}
        items={getOptions()}
      />
    </NotificationCard>
  );
};

export default ElementShared;
