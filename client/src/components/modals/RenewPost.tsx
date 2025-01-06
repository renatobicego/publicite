"use client"
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import PrimaryButton from "../buttons/PrimaryButton";
import { updateEndDate } from "@/app/server/postActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next/navigation";

const RenewPost = ({ postTitle, id }: { postTitle: string; id: string }) => {
  const { onOpen, isOpen, onOpenChange, onClose } = useDisclosure();
  const router = useRouter();
  const handleUpdateEndDate = async () => {
    const res = await updateEndDate(id);
    if (res.error) {
      toastifyError(res.error);
      return;
    }
    onClose();
    toastifySuccess(res.message);
    router.refresh();
  };
  return (
    <>
      <PrimaryButton variant="flat" size="sm" onPress={onOpen}>
        Renovar
      </PrimaryButton>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Renovar Anuncio - {postTitle}</ModalHeader>
              <ModalBody>
                <p className="text-light-text text-sm"> 
                  Al renovar el anuncio, se extenderá la fecha de vencimiento
                  por 7 días
                </p>
              </ModalBody>
              <ModalFooter>
                <PrimaryButton variant="light" onPress={onClose}>
                  Cancelar
                </PrimaryButton>
                <PrimaryButton onPress={handleUpdateEndDate}>
                  Renovar
                </PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default RenewPost;
