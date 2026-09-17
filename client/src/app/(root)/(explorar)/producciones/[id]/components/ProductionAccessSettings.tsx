"use client";
import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  setProductionVisibility,
  setProductionAccessKey,
  setProductionPayoutAlias,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionResponse,
  ProductionVisibility,
} from "@/types/productionTypes";
import {
  visibilityLabel,
  visibilityOptions,
} from "../../productionVisibility";

interface Props {
  production: ProductionResponse;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

/**
 * Configuración de alcance por defecto del blog (VIS-01) y clave tipo Zoom
 * (INV-01). La clave reemplaza al alcance. Sólo staff (`canManageAccess`).
 */
const ProductionAccessSettings = ({
  production,
  isOpen,
  onOpenChange,
  onChanged,
}: Props) => {
  const [visibility, setVisibility] = useState<ProductionVisibility>(
    production.visibility
  );
  const [accessKey, setAccessKey] = useState("");
  const [aliasCbu, setAliasCbu] = useState(production.aliasCbu ?? "");
  const [busy, setBusy] = useState(false);
  const canManagePayout = production.viewer?.canManagePayout;

  const handleSetPayout = async () => {
    if (aliasCbu.trim().length < 6) {
      toastifyError("Ingresá un alias (6-20) o CBU/CVU (22 dígitos) válido");
      return;
    }
    setBusy(true);
    try {
      const res = await setProductionPayoutAlias(
        production._id,
        aliasCbu.trim()
      );
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Alias/CBU de cobro guardado");
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const handleVisibility = async (value: ProductionVisibility) => {
    setBusy(true);
    try {
      const res = await setProductionVisibility(production._id, value);
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      setVisibility(value);
      toastifySuccess("Alcance actualizado");
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const handleSetKey = async (key: string | null) => {
    if (key !== null && (key.length < 4 || key.length > 128)) {
      toastifyError("La clave debe tener entre 4 y 128 caracteres");
      return;
    }
    setBusy(true);
    try {
      const res = await setProductionAccessKey(production._id, key);
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(key ? "Clave configurada" : "Clave quitada");
      setAccessKey("");
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Alcance y clave</ModalHeader>
            <ModalBody className="gap-5">
              <div>
                <p className="text-sm font-medium mb-2">
                  Alcance por defecto del blog
                </p>
                <Select
                  aria-label="Alcance del blog"
                  selectedKeys={[visibility]}
                  isDisabled={busy || production.hasAccessKey}
                  onChange={(e) =>
                    handleVisibility(e.target.value as ProductionVisibility)
                  }
                >
                  {visibilityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {visibilityLabel[option]}
                    </SelectItem>
                  ))}
                </Select>
                {production.hasAccessKey && (
                  <p className="text-xs text-default-500 mt-1">
                    Con clave activa, el alcance no se aplica.
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Clave tipo Zoom</p>
                {production.hasAccessKey ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-default-600">
                      El blog tiene una clave activa.
                    </span>
                    <Button
                      color="danger"
                      variant="flat"
                      size="sm"
                      isDisabled={busy}
                      onPress={() => handleSetKey(null)}
                    >
                      Quitar clave
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <Input
                      type="password"
                      label="Nueva clave (4 a 128)"
                      value={accessKey}
                      onValueChange={setAccessKey}
                    />
                    <PrimaryButton
                      onClick={() => handleSetKey(accessKey)}
                      disabled={busy}
                    >
                      Guardar
                    </PrimaryButton>
                  </div>
                )}
                <p className="text-xs text-default-500 mt-1">
                  Cambiar la clave invalida los accesos anteriores.
                </p>
              </div>

              {canManagePayout && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Alias / CBU de cobro (tickets pagos)
                  </p>
                  <div className="flex items-end gap-2">
                    <Input
                      label="Alias o CBU/CVU"
                      value={aliasCbu}
                      onValueChange={setAliasCbu}
                    />
                    <PrimaryButton onClick={handleSetPayout} disabled={busy}>
                      Guardar
                    </PrimaryButton>
                  </div>
                  <p className="text-xs text-default-500 mt-1">
                    Necesario para cobrar con tickets pagos. Se liquida el 90%.
                  </p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} isDisabled={busy}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ProductionAccessSettings;
