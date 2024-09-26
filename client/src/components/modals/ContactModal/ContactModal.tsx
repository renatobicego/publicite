"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import PrimaryButton from "../../buttons/PrimaryButton";
import ContactForm from "./ContactForm";

const ContactModal = ({ postId }: { postId: string }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <PrimaryButton onPress={onOpen}>Contactar</PrimaryButton>
      <Modal radius="lg" className="p-2" size="2xl" placement="center" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Solicitud de Contacto
              </ModalHeader>
              <ModalBody className="pt-0">
                <ContactForm postId={postId} onClose={onClose}/>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ContactModal;
