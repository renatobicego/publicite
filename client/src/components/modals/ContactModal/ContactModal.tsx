"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import PrimaryButton from "../../buttons/PrimaryButton";
import { lazy } from "react";
const ContactForm = lazy(() => import("./ContactForm"));

const ContactModal = ({
  postId,
  authorId,
}: {
  postId: string;
  authorId: ObjectId;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <PrimaryButton onPress={onOpen}>Contactar</PrimaryButton>
      <Modal
        radius="lg"
        className="p-2"
        size="2xl"
        placement="center"
        isOpen={isOpen}
        isDismissable={false}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Solicitud de Contacto
              </ModalHeader>
              <ModalBody className="pt-0">
                {isOpen && (
                  <ContactForm
                    postId={postId}
                    onClose={onClose}
                    authorId={authorId}
                  />
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ContactModal;
