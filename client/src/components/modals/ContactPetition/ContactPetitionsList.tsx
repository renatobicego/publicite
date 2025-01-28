"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import {
  ContactSellerNotification,
  Good,
  Petition,
  Service,
} from "@/types/postTypes";
import { MdContacts } from "react-icons/md";
import { useEffect, useState } from "react";
import {
  getContactPetitionsOfPost,
  getContactPetitionsOfUser,
} from "@/services/contactPetitionServices";
import ContactPetitionCard from "./ContactPetitionCard";

const ContactPetitionsList = ({
  post,
  userId,
}: {
  post?: Good | Service | Petition;
  userId?: string;
}) => {
  const [contactPetitions, setContactPetitions] = useState<
    ContactSellerNotification[]
  >([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    const fetchContactPetitions = async () => {
      if (post) {
        const contactPetitionsOfUser = await getContactPetitionsOfPost(
          post._id
        );
        setContactPetitions(contactPetitionsOfUser);
        return;
      } else if (userId) {
        const contactPetitionsOfUser = await getContactPetitionsOfUser(userId);
        setContactPetitions(contactPetitionsOfUser);
        return;
      }
    };

    fetchContactPetitions();
  }, [post, userId]);

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
                      key={petition._id}
                      contactPetition={petition}
                    />
                  ))}
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
