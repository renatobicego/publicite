"use client";
import { useEffect, useState } from "react";
import {
  Checkbox,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  getProductionTicketCheckout,
  purchaseProductionTicket,
} from "@/app/server/productionActions";
import { useUploadThing } from "@/utils/uploadThing";
import { deleteFilesService } from "@/app/server/uploadThing";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionTicketCheckout,
  ProductionTicketPurchaseStatus,
} from "@/types/productionTypes";

interface Props {
  ticketId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchased: () => void;
}

/** Flujo de compra de un ticket por transferencia (TKT-04/05). */
const TicketCheckoutModal = ({
  ticketId,
  isOpen,
  onOpenChange,
  onPurchased,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState<ProductionTicketCheckout | null>(
    null
  );
  const [acceptNoRefund, setAcceptNoRefund] = useState(false);
  const [transferReference, setTransferReference] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const { startUpload } = useUploadThing("uploadSingleFile", {
    onUploadError: (e) => {
      toastifyError(`Error al subir el comprobante: ${e.name}`);
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    setReceipt(null);
    setAcceptNoRefund(false);
    let active = true;
    setLoading(true);
    (async () => {
      const res = await getProductionTicketCheckout(ticketId);
      if (!active) return;
      if (isProductionActionError(res)) {
        toastifyError(res.error);
      } else {
        setCheckout(res);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isOpen, ticketId]);

  const handlePurchase = async () => {
    if (!checkout) return;
    if (checkout.requiresNoRefundAcceptance && !acceptNoRefund) {
      toastifyError("Tenés que aceptar la política de no devoluciones");
      return;
    }
    const isPaid = checkout.ticket.isPaid;
    if (isPaid && !receipt) {
      toastifyError("Subí el comprobante de la transferencia");
      return;
    }
    setBusy(true);
    try {
      let transferReceiptKey: string | undefined;
      if (isPaid && receipt) {
        const uploaded = await startUpload([receipt]);
        transferReceiptKey = uploaded?.[0]?.key;
        if (!transferReceiptKey) {
          toastifyError("No se pudo subir el comprobante");
          return;
        }
      }
      const res = await purchaseProductionTicket({
        ticketId,
        acceptNoRefund,
        transferReference: transferReference.trim() || undefined,
        transferReceiptKey,
      });
      if (isProductionActionError(res)) {
        // La compra no se registró: no dejar el comprobante huérfano.
        if (transferReceiptKey) deleteFilesService([transferReceiptKey]);
        toastifyError(res.error);
        return;
      }
      if (res.status === ProductionTicketPurchaseStatus.active) {
        toastifySuccess("¡Acceso habilitado!");
      } else {
        toastifySuccess(
          "Compra registrada. Queda pendiente hasta confirmar la transferencia."
        );
      }
      onPurchased();
    } finally {
      setBusy(false);
    }
  };

  const ticket = checkout?.ticket;
  const instructions = checkout?.paymentInstructions;
  const existing = checkout?.existingPurchase;
  // Sin la cuenta de Soonpublicité cargada no hay a dónde transferir.
  const missingAccount =
    !!ticket?.isPaid && !instructions?.alias && !instructions?.cbu;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Comprar acceso</ModalHeader>
            <ModalBody className="gap-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : !checkout ? (
                <p className="text-sm text-danger">
                  No se pudo cargar el checkout.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{checkout.productionTitle}</span>
                    {ticket?.isPaid ? (
                      <Chip color="warning" variant="flat">
                        {ticket.currency} {ticket.price}
                      </Chip>
                    ) : (
                      <Chip color="success" variant="flat">
                        Gratuito
                      </Chip>
                    )}
                  </div>
                  <p className="text-sm text-default-600">
                    Incluye {ticket?.filesCount ?? 0} archivo(s).{" "}
                    {ticket?.untilClose
                      ? "Acceso hasta el cierre del blog."
                      : ticket?.durationHours
                      ? `Acceso por ${ticket.durationHours} horas.`
                      : ""}
                  </p>

                  {existing && (
                    <p className="text-xs text-warning">
                      Ya tenés una compra {existing.status} para este ticket.
                    </p>
                  )}

                  {checkout.noRefundWarning && (
                    <p className="text-xs text-default-500">
                      {checkout.noRefundWarning}
                    </p>
                  )}

                  {missingAccount && (
                    <p className="text-sm text-danger">
                      La compra de tickets pagos no está disponible por el
                      momento: falta configurar la cuenta para transferir.
                    </p>
                  )}

                  {ticket?.isPaid && instructions && !missingAccount && (
                    <div className="rounded-lg border p-3 text-sm flex flex-col gap-1">
                      <span className="font-medium">Datos para transferir</span>
                      <span className="text-xs text-default-500">
                        La transferencia se hace a la cuenta de Soonpublicité.
                      </span>
                      {instructions.alias && <span>Alias: {instructions.alias}</span>}
                      {instructions.cbu && <span>CBU/CVU: {instructions.cbu}</span>}
                      {instructions.holder && (
                        <span>Titular: {instructions.holder}</span>
                      )}
                      {instructions.bank && <span>Banco: {instructions.bank}</span>}
                      <span>
                        Monto: {instructions.currency} {instructions.amount}
                      </span>
                    </div>
                  )}

                  {ticket?.isPaid && (
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="transfer-receipt"
                        className="text-sm font-medium"
                      >
                        Comprobante de transferencia
                      </label>
                      <input
                        id="transfer-receipt"
                        type="file"
                        accept="image/*,application/pdf"
                        disabled={busy}
                        onChange={(e) =>
                          setReceipt(e.target.files?.[0] ?? null)
                        }
                        className="text-sm"
                      />
                      <p className="text-xs text-default-500">
                        Imagen o PDF, hasta 8 MB. Es obligatorio para
                        confirmar la compra.
                      </p>
                    </div>
                  )}

                  {ticket?.isPaid && (
                    <Input
                      label="Referencia de la transferencia (opcional)"
                      value={transferReference}
                      onValueChange={setTransferReference}
                    />
                  )}

                  {checkout.requiresNoRefundAcceptance && (
                    <Checkbox
                      isSelected={acceptNoRefund}
                      onValueChange={setAcceptNoRefund}
                      size="sm"
                    >
                      Acepto que la compra no tiene devoluciones
                    </Checkbox>
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <PrimaryButton
                onClick={handlePurchase}
                disabled={
                  busy ||
                  loading ||
                  !checkout ||
                  missingAccount ||
                  (checkout.requiresNoRefundAcceptance && !acceptNoRefund) ||
                  (!!ticket?.isPaid && !receipt)
                }
              >
                {busy
                  ? "Procesando…"
                  : ticket?.isPaid
                  ? "Confirmar compra"
                  : "Obtener acceso"}
              </PrimaryButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TicketCheckoutModal;
