import {
  GetContactSellersPetitionDTO,
  Good,
  PetitionContactSeller,
  Post,
} from "@/types/postTypes";
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

const ContactPetitionCard = ({
  contactPetition,
}: {
  contactPetition: GetContactSellersPetitionDTO;
}) => {
  const { client, post, date, isOpinionRequested } = contactPetition;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // TODO add contactPetition.isOpinionRequested button logic
  return (
    <>
      <Card
        shadow="sm"
        className="md:flex-row md:items-center"
        onPress={onOpen}
        isPressable
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
