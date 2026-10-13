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
import { FaUserShield } from "react-icons/fa";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { reportProductionContent } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { ProductionReportReason } from "@/types/productionTypes";

interface Props {
  productionId: string;
  itemId?: string;
  /** Qué se está denunciando, para que el usuario lo confirme antes de enviar. */
  targetLabel: string;
  /** Dueño del blog denunciado (nombre visible). */
  ownerName?: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const reportReasonLabel: Record<ProductionReportReason, string> = {
  [ProductionReportReason.inappropriate]: "Contenido inapropiado",
  [ProductionReportReason.violence]: "Violencia",
  [ProductionReportReason.sexual]: "Contenido sexual",
  [ProductionReportReason.spam]: "Spam",
  [ProductionReportReason.copyright]: "Derechos de autor",
  [ProductionReportReason.other]: "Otro",
};

/** Denuncia de un blog o contenido (DEN-01). */
const ReportModal = ({
  productionId,
  itemId,
  targetLabel,
  ownerName,
  isOpen,
  onOpenChange,
}: Props) => {
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
              <div className="rounded-xl border border-default-200 bg-default-50 px-3 py-2.5 text-sm">
                <p className="text-xs text-default-500">Estás denunciando</p>
                <p className="font-medium break-words">{targetLabel}</p>
                {ownerName && (
                  <p className="text-xs text-default-500">de {ownerName}</p>
                )}
              </div>
              <Select
                label="Motivo"
                selectedKeys={[reason]}
                onChange={(e) =>
                  setReason(e.target.value as ProductionReportReason)
                }
              >
                {Object.values(ProductionReportReason).map((r) => (
                  <SelectItem key={r} value={r}>
                    {reportReasonLabel[r]}
                  </SelectItem>
                ))}
              </Select>
              <Textarea
                label="Detalles (opcional)"
                value={details}
                onValueChange={setDetails}
                maxLength={1000}
              />
              <p className="flex items-start gap-2 text-xs text-default-500">
                <FaUserShield className="mt-0.5 shrink-0" />
                Tu identidad queda protegida: el dueño del blog ve el motivo de
                la denuncia, pero no quién la hizo.
              </p>
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
