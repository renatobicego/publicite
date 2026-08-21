"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

import { useAvatars } from "./AvatarsContext";
import AvatarForm from "./AvatarForm";

interface CreateAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAvatarModal({
  isOpen,
  onClose,
}: CreateAvatarModalProps) {
  const { create } = useAvatars();
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setContext("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!name.trim() || !context.trim()) return;
    setIsSaving(true);
    const created = await create({
      name: name.trim(),
      context: context.trim(),
    });
    setIsSaving(false);
    if (created) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      size="lg"
      scrollBehavior="inside"
      isDismissable={!isSaving}
      hideCloseButton={isSaving}
    >
      <ModalContent>
        <ModalHeader>Crear nuevo Avatar</ModalHeader>
        <ModalBody>
          <AvatarForm
            name={name}
            context={context}
            onNameChange={setName}
            onContextChange={setContext}
            previewSeed={name}
            isDisabled={isSaving}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            radius="full"
            onPress={onClose}
            isDisabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            className="bg-service text-white"
            radius="full"
            onPress={handleSubmit}
            isDisabled={!name.trim() || !context.trim()}
            isLoading={isSaving}
          >
            Crear
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
