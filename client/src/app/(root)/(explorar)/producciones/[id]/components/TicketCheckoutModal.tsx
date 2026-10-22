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
import { FaCopy, FaTicketAlt } from "react-icons/fa";
import { isAccessSuspended } from "../../productionTicketStatus";
import {
  formatTicketDuration,
  formatTicketPrice,
  ticketActionLabel,
} from "../../productionTicketCopy";

interface Props {
  ticketId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchased: () => void;
}

const hasAccount = (
  instructions?: ProductionTicketPaymentInstructions | null,
) => !!instructions?.alias || !!instructions?.cbu;

/** Dato de la cuenta con botón para copiarlo. */
const CopyLine = ({ label, value }: { label: string; value: string }) => (
  <span className="flex items-center gap-2">
    <span>
      {label}: <span className="font-mono">{value}</span>
    </span>
    <button
      type="button"
      className="text-default-500 hover:text-default-800"
      aria-label={`Copiar ${label}`}
      title="Copiar"
      onClick={() => {
        navigator.clipboard
          ?.writeText(value)
          .then(() => toastifySuccess(`${label} copiado`))
          .catch(() => undefined);
      }}
    >
      <FaCopy />
    </button>
  </span>
);

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
    {instructions.alias && (
      <CopyLine label="Alias" value={instructions.alias} />
    )}
    {instructions.cbu && <CopyLine label="CBU/CVU" value={instructions.cbu} />}
    {instructions.holder && <span>Titular: {instructions.holder}</span>}
    {instructions.bank && <span>Banco: {instructions.bank}</span>}
    <span className="font-semibold">
      Monto: {formatTicketPrice({
        price: instructions.amount,
        currency: instructions.currency,
      })}
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
        toastifySuccess("¡Listo! Ya tenés tu ticket, podés entrar.");
      } else {
        toastifySuccess(
          "¡Listo! Le avisamos al blog. Cuando confirme tu transferencia te habilita el acceso y te llega una notificación.",
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

  const isPaid = !!ticket?.isPaid;
  const suspended = !!existing && isAccessSuspended(existing);
  const isPending =
    existing?.status === ProductionTicketPurchaseStatus.pending;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {loading || !ticket
                ? "Ticket"
                : isPaid
                  ? "Comprar ticket"
                  : "Sacá tu ticket gratis"}
            </ModalHeader>
            <ModalBody className="gap-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : !checkout || !ticket ? (
                <p className="text-sm text-danger">
                  No se pudo cargar el ticket. Probá de nuevo en un rato.
                </p>
              ) : (
                <>
                  {/* Qué incluye */}
                  <div
                    className={`flex items-center gap-3 rounded-xl border-2 border-dashed p-3 ${
                      isPaid
                        ? "border-warning-300 bg-warning-50"
                        : "border-primary-300 bg-primary-50"
                    }`}
                  >
                    <FaTicketAlt
                      className={`shrink-0 text-2xl ${
                        isPaid ? "text-warning-600" : "text-primary-600"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {checkout.productionTitle}
                      </p>
                      <p className="text-xs text-default-600">
                        {ticket.filesCount}{" "}
                        {ticket.filesCount === 1 ? "archivo" : "archivos"} ·
                        acceso {formatTicketDuration(ticket)}
                      </p>
                    </div>
                    <Chip color={isPaid ? "warning" : "primary"} variant="flat">
                      {isPaid ? formatTicketPrice(ticket) : "Gratis"}
                    </Chip>
                  </div>

                  {/* Ya tiene una compra */}
                  {existing && !suspended && (
                    <p
                      className={`rounded-lg px-3 py-2 text-sm ${
                        isPending
                          ? "bg-warning-50 text-warning-800"
                          : "bg-success-50 text-success-800"
                      }`}
                    >
                      {isPending
                        ? "Ya enviaste el pago. El blog está revisando tu transferencia; cuando la confirme te llega una notificación y podés entrar."
                        : "Ya tenés este ticket."}
                    </p>
                  )}

                  {suspended && existing && (
                    <>
                      <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-800">
                        Tu acceso está en pausa: Soonpublicité no registró el
                        pago de la comisión. Transferila y se restablece.
                      </p>
                      {existing.commissionPaymentInstructions && (
                        <TransferBlock
                          title="Comisión de Soonpublicité"
                          hint="Transferí este monto a la cuenta de Soonpublicité."
                          instructions={existing.commissionPaymentInstructions}
                        />
                      )}
                    </>
                  )}

                  {/* Ticket gratuito: un clic */}
                  {!existing && !isPaid && (
                    <p className="text-sm text-default-700">
                      No tenés que pagar nada. Tocá{" "}
                      <span className="font-medium">
                        &quot;Sacar ticket gratis&quot;
                      </span>{" "}
                      y entrás al instante.
                    </p>
                  )}

                  {missingAccount && !existing && (
                    <p className="text-sm text-danger">
                      Por ahora no se puede comprar este ticket: el blog todavía
                      no cargó su cuenta para recibir transferencias.
                    </p>
                  )}

                  {/* Ticket pago: pasos */}
                  {showPaymentForm &&
                    creatorInstructions &&
                    commissionInstructions && (
                      <>
                        <p className="text-sm">
                          Se paga con{" "}
                          <span className="font-semibold">
                            dos transferencias
                          </span>{" "}
                          (una al blog y otra a Soonpublicité). Hacelas desde
                          tu banco o billetera y subí el comprobante de cada
                          una.
                        </p>
                        <TransferBlock
                          title="Paso 1 · Transferencia al blog"
                          hint="Es el pago al creador del blog."
                          instructions={creatorInstructions}
                          inputId="transfer-receipt"
                          disabled={busy}
                          onReceipt={setReceipt}
                        />
                        <TransferBlock
                          title="Paso 2 · Comisión de Soonpublicité"
                          hint="Si no se registra, tu acceso queda en pausa hasta que la pagues."
                          instructions={commissionInstructions}
                          inputId="commission-receipt"
                          disabled={busy}
                          onReceipt={setCommissionReceipt}
                        />
                        <p className="text-xs text-default-500">
                          Comprobantes en imagen o PDF, hasta 8 MB cada uno.
                        </p>
                        <Input
                          label="Referencia de las transferencias (opcional)"
                          value={transferReference}
                          onValueChange={setTransferReference}
                        />
                        <div className="rounded-lg bg-default-100 px-3 py-2 text-xs text-default-600">
                          <span className="font-medium">
                            Paso 3 · Confirmá.
                          </span>{" "}
                          El blog revisa tu transferencia y te habilita el
                          acceso. Te avisamos con una notificación; también lo
                          ves en &quot;Mis tickets&quot;.
                        </div>
                        {checkout.noRefundWarning && (
                          <p className="text-xs text-default-500">
                            {checkout.noRefundWarning}
                          </p>
                        )}
                      </>
                    )}

                  {checkout.requiresNoRefundAcceptance &&
                    !existing &&
                    !missingAccount && (
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
              {existing || missingAccount ? (
                <PrimaryButton onClick={onClose}>Cerrar</PrimaryButton>
              ) : (
                <PrimaryButton
                  onClick={handlePurchase}
                  disabled={
                    busy ||
                    loading ||
                    !checkout ||
                    (checkout.requiresNoRefundAcceptance && !acceptNoRefund) ||
                    (isPaid && (!receipt || !commissionReceipt))
                  }
                >
                  {busy
                    ? "Procesando…"
                    : isPaid
                      ? "Ya transferí, confirmar"
                      : ticket
                        ? ticketActionLabel(ticket)
                        : "Continuar"}
                </PrimaryButton>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TicketCheckoutModal;
