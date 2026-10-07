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
  ProductionTicketPaymentInstructions,
  ProductionTicketPurchaseStatus,
} from "@/types/productionTypes";
import {
  isAccessSuspended,
  purchaseStatusLabel,
} from "../../productionTicketStatus";

interface Props {
  ticketId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchased: () => void;
}

const hasAccount = (
  instructions?: ProductionTicketPaymentInstructions | null,
) => !!instructions?.alias || !!instructions?.cbu;

/** Datos de una de las dos transferencias, con su comprobante. */
const TransferBlock = ({
  title,
  hint,
  instructions,
  inputId,
  disabled,
  onReceipt,
}: {
  title: string;
  hint: string;
  instructions: ProductionTicketPaymentInstructions;
  inputId?: string;
  disabled?: boolean;
  onReceipt?: (file: File | null) => void;
}) => (
  <div className="rounded-lg border p-3 text-sm flex flex-col gap-1">
    <span className="font-medium">{title}</span>
    <span className="text-xs text-default-500">{hint}</span>
    {instructions.alias && <span>Alias: {instructions.alias}</span>}
    {instructions.cbu && <span>CBU/CVU: {instructions.cbu}</span>}
    {instructions.holder && <span>Titular: {instructions.holder}</span>}
    {instructions.bank && <span>Banco: {instructions.bank}</span>}
    <span className="font-medium">
      Monto: {instructions.currency} {instructions.amount}
    </span>
    {inputId && onReceipt && (
      <>
        <label htmlFor={inputId} className="text-xs font-medium mt-2">
          Comprobante de esta transferencia
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*,application/pdf"
          disabled={disabled}
          onChange={(e) => onReceipt(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </>
    )}
  </div>
);

/**
 * Flujo de compra de un ticket (TKT-04/05). Un ticket pago se paga con dos
 * transferencias: la parte del creador al blog y la comisión a Soonpublicité,
 * cada una con su comprobante.
 */
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
  const [commissionReceipt, setCommissionReceipt] = useState<File | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const { startUpload } = useUploadThing("uploadSingleFile", {
    onUploadError: (e) => {
      toastifyError(`Error al subir el comprobante: ${e.name}`);
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    setReceipt(null);
    setCommissionReceipt(null);
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
    if (isPaid && (!receipt || !commissionReceipt)) {
      toastifyError("Subí los comprobantes de las dos transferencias");
      return;
    }
    setBusy(true);
    const uploadedKeys: string[] = [];
    try {
      let transferReceiptKey: string | undefined;
      let commissionReceiptKey: string | undefined;
      if (isPaid && receipt && commissionReceipt) {
        // Una subida por comprobante: la ruta acepta un archivo por vez.
        for (const file of [receipt, commissionReceipt]) {
          const uploaded = await startUpload([file]);
          const key = uploaded?.[0]?.key;
          if (!key) {
            if (uploadedKeys.length) deleteFilesService(uploadedKeys);
            toastifyError("No se pudieron subir los comprobantes");
            return;
          }
          uploadedKeys.push(key);
        }
        [transferReceiptKey, commissionReceiptKey] = uploadedKeys;
      }
      const res = await purchaseProductionTicket({
        ticketId,
        acceptNoRefund,
        transferReference: transferReference.trim() || undefined,
        transferReceiptKey,
        commissionReceiptKey,
      });
      if (isProductionActionError(res)) {
        // La compra no se registró: no dejar los comprobantes huérfanos.
        if (uploadedKeys.length) deleteFilesService(uploadedKeys);
        toastifyError(res.error);
        return;
      }
      if (res.status === ProductionTicketPurchaseStatus.active) {
        toastifySuccess("¡Acceso habilitado!");
      } else {
        toastifySuccess(
          "Compra registrada. El acceso se habilita cuando el blog verifique tu transferencia."
        );
      }
      onPurchased();
    } finally {
      setBusy(false);
    }
  };

  const ticket = checkout?.ticket;
  const creatorInstructions = checkout?.creatorPaymentInstructions;
  const commissionInstructions = checkout?.commissionPaymentInstructions;
  const existing = checkout?.existingPurchase;
  // Hacen falta las dos cuentas: la del blog y la de Soonpublicité.
  const missingAccount =
    !!ticket?.isPaid &&
    (!hasAccount(creatorInstructions) || !hasAccount(commissionInstructions));
  // Con una compra abierta no se compra de nuevo: se muestra en qué está.
  const showPaymentForm = !!ticket?.isPaid && !missingAccount && !existing;

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

                  {existing && !isAccessSuspended(existing) && (
                    <p className="text-sm text-warning">
                      Ya tenés una compra de este ticket (
                      {purchaseStatusLabel[existing.status].toLowerCase()}).
                      {existing.status ===
                        ProductionTicketPurchaseStatus.pending &&
                        " El acceso se habilita cuando el blog verifique tu transferencia."}
                    </p>
                  )}

                  {existing && isAccessSuspended(existing) && (
                    <>
                      <p className="text-sm text-danger">
                        Tu acceso está suspendido: Soonpublicité no registró el
                        pago de la comisión. Se restablece cuando la pagues.
                      </p>
                      {existing.commissionPaymentInstructions && (
                        <TransferBlock
                          title="Comisión de Soonpublicité"
                          hint="Transferí la comisión a la cuenta de Soonpublicité."
                          instructions={existing.commissionPaymentInstructions}
                        />
                      )}
                    </>
                  )}

                  {!existing && checkout.noRefundWarning && (
                    <p className="text-xs text-default-500">
                      {checkout.noRefundWarning}
                    </p>
                  )}

                  {missingAccount && !existing && (
                    <p className="text-sm text-danger">
                      La compra de tickets pagos no está disponible por el
                      momento: falta configurar la cuenta para transferir.
                    </p>
                  )}

                  {showPaymentForm && creatorInstructions && (
                    <>
                      <p className="text-sm">
                        Este ticket se paga con{" "}
                        <span className="font-medium">dos transferencias</span>
                        : una al blog y otra a Soonpublicité. Hacé las dos y
                        subí los dos comprobantes.
                      </p>
                      <TransferBlock
                        title="1. Transferencia al blog"
                        hint="Es la parte del creador. Cuando la verifique, habilita tu acceso."
                        instructions={creatorInstructions}
                        inputId="transfer-receipt"
                        disabled={busy}
                        onReceipt={setReceipt}
                      />
                    </>
                  )}

                  {showPaymentForm && commissionInstructions && (
                    <>
                      <TransferBlock
                        title="2. Comisión de Soonpublicité"
                        hint="Va a la cuenta de Soonpublicité. Si no se registra el pago, tu acceso se suspende hasta que la pagues."
                        instructions={commissionInstructions}
                        inputId="commission-receipt"
                        disabled={busy}
                        onReceipt={setCommissionReceipt}
                      />
                      <p className="text-xs text-default-500">
                        Comprobantes en imagen o PDF, hasta 8 MB cada uno. Los
                        dos son obligatorios.
                      </p>
                      <Input
                        label="Referencia de las transferencias (opcional)"
                        value={transferReference}
                        onValueChange={setTransferReference}
                      />
                    </>
                  )}

                  {checkout.requiresNoRefundAcceptance && !existing && (
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
                  !!existing ||
                  missingAccount ||
                  (checkout.requiresNoRefundAcceptance && !acceptNoRefund) ||
                  (!!ticket?.isPaid && (!receipt || !commissionReceipt))
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
