import { Button, Image, Link, useDisclosure } from "@nextui-org/react";
import {
  NotificationBody,
  NotificationCard,
  NotificationImage,
  NotificationOptions,
} from "./NotificationCard";
import { PROFILE } from "@/utils/data/urls";
import { showDate } from "@/utils/functions/dates";
import { parseDate } from "@internationalized/date";
import { NewContactRelationNotification } from "@/types/userTypes";
import { relationTypes } from "@/utils/data/selectData";
import ChangeTypeRelationContact from "../modals/ChangeTypeRelationContact";

const NewContactRequest = ({
  notification,
}: {
  notification: NewContactRelationNotification;
}) => {
  const { user } = notification;
  const relationType = relationTypes.find(
    (type) => type.value === notification.typeRelation
  )?.label;
  const { onOpenChange, onOpen, isOpen } = useDisclosure();
  return (
    <>
      <NotificationCard>
        <NotificationImage>
          <Image
            radius="full"
            src={user.profilePhotoUrl}
            alt="foto"
            className="object-cover w-16 h-16"
          />
        </NotificationImage>
        <NotificationBody>
          <p className="text-sm">
            <span className="font-semibold">{user.username}</span> quiere ser tu
            <span className="lowercase"> {relationType}</span>
          </p>
        </NotificationBody>
        <NotificationOptions
          date={showDate(parseDate(notification.date))}
          items={[
            {
              label: "Aceptar Solicitud",
            },
            {
              label: "Cambiar Tipo de Relación",
              as: Button,
              onPress: onOpen,
            },
            {
              label: "Ver Perfil",
              as: Link,
              className: "text-text-color",
              href: `${PROFILE}/${user.username}`,
            },
            {
              label: "Rechazar Solicitud",
              color: "danger",
            },
          ]}
        />
      </NotificationCard>
      <ChangeTypeRelationContact isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export default NewContactRequest;
