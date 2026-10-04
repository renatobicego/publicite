"use client";
import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { reportProductionContent } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { ProductionReportReason } from "@/types/productionTypes";

interface Props {
  productionId: string;
  itemId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const reasonLabel: Record<ProductionReportReason, string> = {
  [ProductionReportReason.inappropriate]: "Contenido inapropiado",
  [ProductionReportReason.violence]: "Violencia",
  [ProductionReportReason.sexual]: "Contenido sexual",
  [ProductionReportReason.spam]: "Spam",
  [ProductionReportReason.copyright]: "Derechos de autor",
  [ProductionReportReason.other]: "Otro",
};

/** Denuncia de un blog o contenido (DEN-01). */
const ReportModal = ({ productionId, itemId, isOpen, onOpenChange }: Props) => {
  const [reason, setReason] = useState<ProductionReportReason>(
    ProductionReportReason.inappropriate
  );
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const res = await reportProductionContent({
        productionId,
        itemId,
        reason,
        details: details.trim() || undefined,
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(
        res.contentHidden
          ? "Denuncia registrada. El contenido se ocultó para revisión."
          : "Denuncia registrada. Gracias por avisar."
      );
      setDetails("");
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Denunciar</ModalHeader>
            <ModalBody className="gap-3">
              <Select
                label="Motivo"
                selectedKeys={[reason]}
                onChange={(e) =>
                  setReason(e.target.value as ProductionReportReason)
                }
              >
                {Object.values(ProductionReportReason).map((r) => (
                  <SelectItem key={r} value={r}>
                    {reasonLabel[r]}
                  </SelectItem>
                ))}
              </Select>
              <Textarea
                label="Detalles (opcional)"
                value={details}
                onValueChange={setDetails}
                maxLength={1000}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} isDisabled={busy}>
                Cancelar
              </Button>
              <PrimaryButton onClick={submit} disabled={busy}>
                {busy ? "Enviando…" : "Enviar denuncia"}
              </PrimaryButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ReportModal;
