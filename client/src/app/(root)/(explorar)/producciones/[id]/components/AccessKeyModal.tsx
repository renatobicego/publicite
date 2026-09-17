"use client";
import { useState } from "react";
import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { FaLock } from "react-icons/fa";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { unlockProductionWithKey } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";

interface Props {
  productionId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se llama cuando la clave fue aceptada. */
  onUnlocked: () => void;
}

/**
 * Modal de ingreso de clave tipo Zoom (INV-01/02). Requiere login.
 * Tras 5 intentos fallidos el backend bloquea 15 minutos y devuelve el mensaje.
 */
const AccessKeyModal = ({
  productionId,
  isOpen,
  onOpenChange,
  onUnlocked,
}: Props) => {
  const [accessKey, setAccessKey] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (accessKey.length < 4) {
      toastifyError("La clave tiene al menos 4 caracteres");
      return;
    }
    setBusy(true);
    try {
      const res = await unlockProductionWithKey(productionId, accessKey);
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Acceso habilitado");
      setAccessKey("");
      onUnlocked();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <FaLock /> Blog protegido
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-default-600">
                Este blog pide una clave para verse. Ingresala para continuar.
              </p>
              <Input
                autoFocus
                type="password"
                label="Clave"
                value={accessKey}
                onValueChange={setAccessKey}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
            </ModalBody>
            <ModalFooter>
              <PrimaryButton onClick={handleSubmit} disabled={busy}>
                {busy ? "Verificando…" : "Ingresar"}
              </PrimaryButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AccessKeyModal;
