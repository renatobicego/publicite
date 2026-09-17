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
  Spinner,
  Switch,
} from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  getProductionTickets,
  createProductionTicket,
  updateProductionTicket,
  deleteProductionTicket,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { ProductionTicket } from "@/types/productionTypes";

interface Props {
  productionId: string;
  /** Item destino; vacío = todo el blog. */
  targetId?: string;
  targetName?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

/**
 * Page de Ticket (staff): asigna/edita/quita el ticket de un destino
 * (carpeta, archivo o blog). Toggle pago/gratuito, precio y duración.
 */
const TicketManagerModal = ({
  productionId,
  targetId,
  targetName,
  isOpen,
  onOpenChange,
  onChanged,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState<ProductionTicket | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [durationHours, setDurationHours] = useState("24");
  const [untilClose, setUntilClose] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);
    (async () => {
      const res = await getProductionTickets(productionId);
      if (!active) return;
      if (!isProductionActionError(res)) {
        // El ticket propio de este destino (target null = blog).
        const own = res.find((t) =>
          targetId ? t.target === targetId : !t.target
        );
        if (own) {
          setExisting(own);
          setIsPaid(own.isPaid);
          setPrice(own.price ? String(own.price) : "");
          setDurationHours(
            own.durationHours ? String(own.durationHours) : "24"
          );
          setUntilClose(own.untilClose);
        } else {
          setExisting(null);
        }
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isOpen, productionId, targetId]);

  const handleSave = async () => {
    if (isPaid && (!price || Number(price) <= 0)) {
      toastifyError("Ingresá un precio válido para un ticket pago");
      return;
    }
    setBusy(true);
    try {
      const priceNum = isPaid ? Number(price) : undefined;
      const duration = untilClose ? undefined : Number(durationHours);
      const res = existing
        ? await updateProductionTicket(existing._id, {
            isPaid,
            price: priceNum,
            durationHours: duration,
            untilClose,
          })
        : await createProductionTicket({
            productionId,
            targetId,
            isPaid,
            price: priceNum,
            durationHours: duration,
            untilClose,
          });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(existing ? "Ticket actualizado" : "Ticket creado");
      onChanged();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    setBusy(true);
    try {
      const res = await deleteProductionTicket(existing._id);
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Ticket quitado");
      onChanged();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              Ticket · {targetName || "Todo el blog"}
            </ModalHeader>
            <ModalBody className="gap-4">
              {loading ? (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              ) : (
                <>
                  {existing && existing.stats && (
                    <p className="text-xs text-default-500">
                      {existing.stats.purchases} compras ·{" "}
                      {existing.stats.active} activas · recaudado{" "}
                      {existing.currency} {existing.stats.revenue}
                    </p>
                  )}
                  <Switch isSelected={isPaid} onValueChange={setIsPaid}>
                    Ticket pago
                  </Switch>
                  {isPaid && (
                    <Input
                      type="number"
                      label="Precio"
                      value={price}
                      onValueChange={setPrice}
                      min={0}
                    />
                  )}
                  <Switch isSelected={untilClose} onValueChange={setUntilClose}>
                    Acceso hasta el cierre del blog
                  </Switch>
                  {!untilClose && (
                    <Input
                      type="number"
                      label="Duración (horas, mínimo 24)"
                      value={durationHours}
                      onValueChange={setDurationHours}
                      min={24}
                    />
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter className="justify-between">
              {existing ? (
                <Button
                  color="danger"
                  variant="flat"
                  onPress={handleDelete}
                  isDisabled={busy}
                >
                  Quitar ticket
                </Button>
              ) : (
                <span />
              )}
              <PrimaryButton onClick={handleSave} disabled={busy || loading}>
                {busy ? "Guardando…" : existing ? "Guardar" : "Crear ticket"}
              </PrimaryButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TicketManagerModal;
