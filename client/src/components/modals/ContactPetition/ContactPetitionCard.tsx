import { GetContactSellersPetitionDTO, Good } from "@/types/postTypes";
import { FILE_URL } from "@/utils/data/urls";
import {
  Card,
  CardBody,
  CardHeader,
  Image,
  useDisclosure,
} from "@nextui-org/react";
import ContactPetition from "./ContactPetition";
import { showDate, parseIsoDate } from "@/utils/functions/dates";
import { getLocalTimeZone, today } from "@internationalized/date";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useState } from "react";
import { emitPostCalificationNotification } from "@/components/notifications/postsCalification/emitNotifications";
import { useSocket } from "@/app/socketProvider";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { toastifySuccess } from "@/utils/functions/toastify";
import { handlePostCalificationNotificationError } from "@/components/notifications/postsCalification/actions";

const ContactPetitionCard = ({
  contactPetition,
}: {
  contactPetition: GetContactSellersPetitionDTO;
}) => {
  const { client, post, date, isOpinionRequested, _id } = contactPetition;
  const { userIdLogged } = useUserData();
  const [isOpinionRequestedLocal, setIsOpinionRequestedLocal] =
    useState(isOpinionRequested);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { socket } = useSocket();

  const showAskForOpinion =
    client.clientId &&
    today(getLocalTimeZone()).compare(parseIsoDate(date)) >= 3;

  const sendRequestForOpinion = () => {
    setIsLoading(true);
    if (!client.clientId) return;
    emitPostCalificationNotification(
      socket,
      userIdLogged as string,
      client.clientId,
      {
        event: "notification_new_calification_request",
        payload: {
          contactSeller_id: _id,
          post: post as any,
          postCalificationType: "request",
        },
      },
      null
    )
      .then(() => {
        toastifySuccess("Se ha enviado la solicitud correctamente");
        setIsOpinionRequestedLocal(true);
      })
      .catch(handlePostCalificationNotificationError);
    setIsLoading(false);
  };
  return (
    <>
      <Card
        shadow="sm"
        className="md:flex-row md:items-center"
        onPress={onOpen}
        isHoverable
      >
        <CardHeader className="w-28 h-24 shrink lg:w-32 lg:h-28 2xl:w-36  2xl:h-32 p-2 justify-center">
          <Image
            radius="sm"
            src={FILE_URL + (post as Good).imagesUrls[0]}
            alt={"foto de anuncio " + post.title}
            removeWrapper
            className=" w-full object-cover max-h-full"
          />
        </CardHeader>
        <CardBody className="relative max-md:pt-0 text-xs md:text-sm">
          <h6>{post.title}</h6>
          <p>
            Nombre y Apellido:{" "}
            <span className="font-semibold">
              {client.name + " " + client.lastName}
            </span>
          </p>
          <p>
            Email: <span className="font-semibold">{client.email}</span>
          </p>
          <p className="line-clamp-2 mb-2">&quot;{client.message}&quot;</p>
          {true &&
            (!isOpinionRequestedLocal ? (
              <>
                <PrimaryButton
                  onPress={sendRequestForOpinion}
                  size="sm"
                  className="text-xs "
                  isLoading={isLoading}
                  isDisabled={isLoading}
                >
                  ¿Lograste una Venta? Solicitar Opinión
                </PrimaryButton>
                <small className="mb-4">
                  Solo los usuarios registrados que realizaron una solicitud de
                  contacto
                </small>
              </>
            ) : (
              <PrimaryButton size="sm" className="text-xs mb-4" isDisabled>
                Petición de Calificación Enviada
              </PrimaryButton>
            ))}
          <p className="text-light-text text-xs absolute bottom-2 right-3">
            {showDate(parseIsoDate(date))}
          </p>
        </CardBody>
      </Card>

      <ContactPetition
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        contactPetitionData={contactPetition}
      />
    </>
  );
};

export default ContactPetitionCard;
