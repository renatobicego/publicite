import { Good, ContactSellerNotification } from "@/types/postTypes";
import { FILE_URL } from "@/utils/data/urls";
import {
  Card,
  CardBody,
  CardHeader,
  Image,
  useDisclosure,
} from "@nextui-org/react";
import ContactPetition from "./ContactPetition";

const ContactPetitionCard = ({
  contactPetition,
}: {
  contactPetition: ContactSellerNotification;
}) => {
  const {
    frontData: {
      contactSeller: { post, client },
    },
  } = contactPetition;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Card
        shadow="sm"
        className="md:flex-row md:items-center"
        onPress={onOpen}
        isPressable
        isHoverable
      >
        <CardHeader className="max-w-24 max-h-24 lg:max-w-28 lg:max-h-28 2xl:max-w-32  2xl:max-h-32 p-2 justify-center">
          <Image
            radius="sm"
            src={FILE_URL + (post as Good).imagesUrls[0]}
            alt="foto"
            className="object-cover"
            classNames={{
              wrapper: "w-full !max-w-full",
            }}
          />
        </CardHeader>
        <CardBody className=" max-md:pt-0 text-xs md:text-sm">
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
          <p className="line-clamp-2">&quot;{client.message}&quot;</p>
        </CardBody>
      </Card>

      <ContactPetition
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        notification={contactPetition}
      />
    </>
  );
};

export default ContactPetitionCard;
