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
  setProductionPayoutAlias,
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
  /** Alias/CBU de cobro actual del blog. */
  aliasCbu?: string | null;
  /** Sólo el admin del blog puede cargar el alias. */
  canManagePayout?: boolean;
  /** Comisión de Soonpublicité sobre tickets pagos (0-100). */
  commissionPercent?: number | null;
  /**
   * Si el destino tiene contenido para vender. `false` impide el ticket pago;
   * sin definir, lo valida el server al guardar.
   */
  hasContent?: boolean;
}

// Respaldo si el server todavía no informa el porcentaje.
const DEFAULT_COMMISSION_PERCENT = 10;

const formatMoney = (value: number) =>
  value.toLocaleString("es-AR", { maximumFractionDigits: 2 });

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
  aliasCbu: currentAlias,
  canManagePayout,
  commissionPercent,
  hasContent,
}: Props) => {
  const commission = commissionPercent ?? DEFAULT_COMMISSION_PERCENT;
  const [aliasCbu, setAliasCbu] = useState(currentAlias ?? "");
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState<ProductionTicket | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [durationHours, setDurationHours] = useState("24");
  const [untilClose, setUntilClose] = useState(false);
  const [busy, setBusy] = useState(false);
  // Sin contenido no se puede pasar a pago (un ticket que ya es pago se puede
  // seguir editando).
  const paidBlocked = hasContent === false && !existing?.isPaid;

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
          targetId ? t.target === targetId : !t.target,
        );
        if (own) {
          setExisting(own);
          setIsPaid(own.isPaid);
          setPrice(own.price ? String(own.price) : "");
          setDurationHours(
            own.durationHours ? String(own.durationHours) : "24",
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

  useEffect(() => {
    if (isOpen) setAliasCbu(currentAlias ?? "");
  }, [isOpen, currentAlias]);

  const handleSave = async () => {
    if (isPaid && (!price || Number(price) <= 0)) {
      toastifyError("Ingresá un precio válido para un ticket pago");
      return;
    }
    const aliasChanged =
      isPaid && canManagePayout && aliasCbu.trim() !== (currentAlias ?? "");
    if (aliasChanged && aliasCbu.trim().length < 6) {
      toastifyError("Ingresá un alias (6-20) o CBU/CVU (22 dígitos) válido");
      return;
    }
    setBusy(true);
    try {
      if (aliasChanged) {
        const aliasRes = await setProductionPayoutAlias(
          productionId,
          aliasCbu.trim(),
        );
        if (isProductionActionError(aliasRes)) {
          toastifyError(aliasRes.error);
          return;
        }
      }
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
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Ticket · {targetName || "Todo el blog"}</ModalHeader>
              <ModalBody className="gap-4">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <Spinner />
                  </div>
                ) : (
                  <>
                    {existing && existing.stats && (
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs text-default-500">
                          <p>
                            {existing.stats.purchases} compras ·{" "}
                            {existing.stats.active} activas
                            {existing.isPaid && (
                              <>
                                {" "}
                                · recaudado {existing.currency}{" "}
                                {formatMoney(existing.stats.netRevenue)}
                              </>
                            )}
                          </p>
                          {existing.isPaid && existing.stats.revenue > 0 && (
                            <p>
                              Vendido {existing.currency}{" "}
                              {formatMoney(existing.stats.revenue)} − comisión{" "}
                              {existing.currency}{" "}
                              {formatMoney(existing.stats.commission)} · ya
                              liquidado {existing.currency}{" "}
                              {formatMoney(existing.stats.paidOut)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    <Switch
                      isSelected={isPaid}
                      onValueChange={setIsPaid}
                      isDisabled={paidBlocked}
                    >
                      Ticket pago
                    </Switch>
                    {paidBlocked && (
                      <p className="text-xs text-warning -mt-2">
                        {targetId
                          ? "Este elemento todavía no tiene contenido."
                          : "El blog todavía no tiene contenido."}{" "}
                        Agregá al menos un archivo o artículo para poder cobrar
                        con ticket pago.
                      </p>
                    )}
                    {isPaid && (
                      <Input
                        type="number"
                        label="Precio"
                        value={price}
                        onValueChange={setPrice}
                        min={0}
                      />
                    )}
                    {isPaid && (
                      <p className="text-xs text-default-500 -mt-2">
                        Soonpublicité cobra una comisión del {commission}% sobre
                        cada ticket vendido
                        {Number(price) > 0 && (
                          <>
                            : por cada venta recibís{" "}
                            {formatMoney(
                              Math.round(Number(price) * (100 - commission)) /
                                100,
                            )}{" "}
                            y{" "}
                            {formatMoney(
                              Math.round(Number(price) * commission) / 100,
                            )}{" "}
                            quedan de comisión
                          </>
                        )}
                        .
                      </p>
                    )}
                    {isPaid && canManagePayout && (
                      <div>
                        <Input
                          label="Alias o CBU/CVU de cobro"
                          value={aliasCbu}
                          onValueChange={setAliasCbu}
                        />
                        <p className="text-xs text-default-500 mt-1">
                          Cuenta donde se liquida lo recaudado (el{" "}
                          {100 - commission}%, ya descontada la comisión). Es
                          necesaria para cobrar con tickets pagos y vale para
                          todo el blog.
                        </p>
                      </div>
                    )}
                    {isPaid && !canManagePayout && !currentAlias && (
                      <p className="text-xs text-warning">
                        Falta cargar el alias/CBU de cobro; sólo el admin del
                        blog puede hacerlo.
                      </p>
                    )}
                    <Switch
                      isSelected={untilClose}
                      onValueChange={setUntilClose}
                    >
                      Acceso hasta el cierre del blog
                    </Switch>
                    <p className="text-xs text-default-500 -mt-2">
                      {untilClose
                        ? "El acceso no vence: quien consiga el ticket puede entrar mientras el blog exista."
                        : "Por defecto el acceso vence pasado un tiempo. Activá esta opción si querés que no venza."}
                    </p>
                    {!untilClose && (
                      <div>
                        <Input
                          type="number"
                          label="Duración (horas, mínimo 24)"
                          value={durationHours}
                          onValueChange={setDurationHours}
                          min={24}
                        />
                        <p className="text-xs text-default-500 mt-1">
                          Es el tiempo que dura el acceso de cada persona,
                          contado desde que se activa su ticket
                          {isPaid ? " (al confirmarse el pago)" : ""}. Por
                          ejemplo, 24 = un día, 168 = una semana, 720 = un mes.
                          Al vencer, deberá conseguir un ticket nuevo.
                        </p>
                      </div>
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
    </>
  );
};

export default TicketManagerModal;
