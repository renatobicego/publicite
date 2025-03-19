"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Skeleton,
  useDisclosure,
} from "@nextui-org/react";
import PrimaryButton from "../../buttons/PrimaryButton";
import { lazy, Suspense } from "react";
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
      <PrimaryButton id="contact-button" onPress={onOpen}>
        Contactar
      </PrimaryButton>
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
                  <Suspense
                    fallback={
                      <>
                        <Skeleton className="rounded-lg w-full h-28" />
                        <Skeleton className="rounded-lg w-full h-16" />
                        <Skeleton className="rounded-lg w-full h-16" />
                      </>
                    }
                  >
                    <ContactForm
                      postId={postId}
                      onClose={onClose}
                      authorId={authorId}
                    />
                  </Suspense>
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
