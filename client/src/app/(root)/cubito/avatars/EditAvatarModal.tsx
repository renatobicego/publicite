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

import { Avatar } from "@/types/avatarTypes";
import { useAvatars } from "./AvatarsContext";
import AvatarForm from "./AvatarForm";

interface EditAvatarModalProps {
  avatar: Avatar | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditAvatarModal({
  avatar,
  isOpen,
  onClose,
}: EditAvatarModalProps) {
  const { update } = useAvatars();
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && avatar) {
      setName(avatar.name);
      setContext(avatar.context);
    }
  }, [isOpen, avatar]);

  const hasChanges =
    !!avatar && (name.trim() !== avatar.name || context.trim() !== avatar.context);

  const handleSubmit = async () => {
    if (!avatar || !name.trim() || !context.trim()) return;
    setIsSaving(true);
    const updated = await update({
      avatarId: avatar._id,
      name: name.trim(),
      context: context.trim(),
    });
    setIsSaving(false);
    if (updated) onClose();
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
        <ModalHeader>Editar Avatar</ModalHeader>
        <ModalBody>
          <AvatarForm
            name={name}
            context={context}
            onNameChange={setName}
            onContextChange={setContext}
            // La imagen depende del _id, así que no cambia al renombrar.
            previewSeed={avatar?.seed ?? avatar?._id ?? ""}
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
            isDisabled={!hasChanges || !name.trim() || !context.trim()}
            isLoading={isSaving}
          >
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
