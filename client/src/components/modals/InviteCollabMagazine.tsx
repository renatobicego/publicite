"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import SecondaryButton from "../buttons/SecondaryButton";
import { Magazine } from "@/types/postTypes";

const InviteCollabMagazine = ({magazine} : {magazine: Magazine}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <SecondaryButton onPress={onOpen} variant="flat" className="order-last">
        Invitar Colaboradores
      </SecondaryButton>
      <Modal radius="lg" className="p-2"  isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Invitar Colaboradores a {magazine.name}
              </ModalHeader>
              <ModalBody>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="primary" onPress={onClose}>
                  Invitar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default InviteCollabMagazine;
