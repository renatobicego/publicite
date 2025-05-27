"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Spinner,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import {
  GetContactSellersPetitionDTO,
  Good,
  Petition,
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
    GetContactSellersPetitionDTO[]
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    const fetchContactPetitions = async () => {
      setIsLoading(true);
      const contactPetitions = await getContactSellers(
        post ? "post" : "profile",
        post ? post._id : (userId as string),
        page
      );
      if ("error" in contactPetitions) {
        toastifyError(contactPetitions.error as string);
        setIsLoading(false);
        return;
      }
      setContactPetitions(contactPetitions.contactSeller);
      setHasMore(contactPetitions.hasMore);
      setIsLoading(false);
    };

    if (isOpen && hasMore) {
      fetchContactPetitions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, userId, isOpen, page]);

  const rowsPerPage = 20;

  const pages = Math.ceil(contactPetitions.length / rowsPerPage);

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
          id="contact-petitions-button"
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
                  contactPetitions.map((petition, index) => (
                    <ContactPetitionCard
                      key={index}
                      contactPetition={petition}
                    />
                  ))}
                {isLoading ? (
                  <Spinner color="warning" />
                ) : (
                  contactPetitions.length === 0 &&
                  "No hay peticiones de contacto"
                )}
                {pages > 1 && (
                  <Pagination
                    total={pages}
                    initialPage={page}
                    onChange={setPage}
                    color="primary"
                    isCompact
                    showControls
                    showShadow
                  />
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
