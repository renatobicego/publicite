"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface Props {
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Borra el blog. El modal queda bloqueado mientras se resuelve. */
  onConfirm: () => Promise<void>;
}

const normalize = (text: string) => text.trim().toLowerCase();

/**
 * Confirmación del borrado de un blog: hay que escribir su nombre. El borrado
 * es definitivo y arrastra todo el contenido.
 */
const DeleteBlogModal = ({ title, isOpen, onOpenChange, onConfirm }: Props) => {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) setTyped("");
  }, [isOpen]);

  const matches = normalize(typed) === normalize(title);

  const handleConfirm = async () => {
    if (!matches) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!busy}
      hideCloseButton={busy}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Eliminar blog</ModalHeader>
            <ModalBody>
              <p className="text-sm">
                Se van a borrar <strong>todas las carpetas, archivos y
                artículos</strong> del blog, junto con sus reseñas y
                comentarios. Esta acción no se puede deshacer.
              </p>
              <p className="text-sm">
                Para confirmar, escribí el nombre del blog:{" "}
                <strong className="break-all">{title}</strong>
              </p>
              <Input
                autoFocus
                aria-label="Nombre del blog"
                placeholder={title}
                value={typed}
                onValueChange={setTyped}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleConfirm();
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} isDisabled={busy}>
                Cancelar
              </Button>
              <Button
                color="danger"
                radius="full"
                onPress={handleConfirm}
                isDisabled={!matches || busy}
                isLoading={busy}
              >
                Eliminar blog
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteBlogModal;
