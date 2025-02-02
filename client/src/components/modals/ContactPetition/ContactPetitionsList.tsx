"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import {
  ContactSellerNotification,
  Good,
  Petition,
  PetitionContactSeller,
  Post,
  Service,
} from "@/types/postTypes";
import { MdContacts } from "react-icons/md";
import { useEffect, useState } from "react";
import ContactPetitionCard from "./ContactPetitionCard";
import { getContactSellers } from "@/services/userServices";
import { toastifyError } from "@/utils/functions/toastify";

const ContactPetitionsList = ({
  post,
  userId,
}: {
  post?: Good | Service | Petition;
  userId?: string;
}) => {
  const [contactPetitions, setContactPetitions] = useState<
    { client: Omit<PetitionContactSeller, "post">; post: Post }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    const fetchContactPetitions = async () => {
      setIsLoading(true);
      const contactPetitions = await getContactSellers(
        post ? "post" : "profile",
        post ? post._id : (userId as string)
      );
      if ("error" in contactPetitions) {
        toastifyError(contactPetitions.error as string);
        setIsLoading(false);
        return;
      }
      setContactPetitions(contactPetitions);
      setIsLoading(false);
    };

    if (isOpen) {
      fetchContactPetitions();
    }
  }, [post, userId, isOpen]);

  return (
    <>
      <Tooltip content="Ver Peticiones de Contacto" placement="bottom">
        <Button
          isIconOnly
          aria-label={"Ver Peticiones de Contacto"}
          onPress={onOpen}
          variant="flat"
          color="primary"
          radius="full"
          className="p-1"
        >
          <MdContacts className="size-5" />
        </Button>
      </Tooltip>
      <Modal
        radius="lg"
        className="p-2"
        placement="center"
        size="xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 max-md:pl-3">
                Peticiones de Contacto {post && `para ${post.title}`}
              </ModalHeader>
              <ModalBody className="max-md:px-3 max-md:pt-0 max-h-[80vh] overflow-y-auto">
                {isOpen &&
                  contactPetitions.map((petition) => (
                    <ContactPetitionCard
                      key={petition.client._id}
                      contactPetition={petition}
                    />
                  ))}
                {isLoading ? (
                  <Spinner color="warning" />
                ) : (
                  contactPetitions.length === 0 &&
                  "No hay peticiones de contacto"
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  radius="full"
                  onPress={onClose}
                >
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ContactPetitionsList;
