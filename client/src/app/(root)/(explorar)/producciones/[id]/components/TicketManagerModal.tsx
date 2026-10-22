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
} from "@nextui-org/react";
import {
  FaCheckCircle,
  FaLockOpen,
  FaMoneyBillWave,
  FaTicketAlt,
} from "react-icons/fa";
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
import {
  TicketAccessType,
  formatTicketHours,
  ticketAccessOptions,
  ticketDurationPresets,
} from "../../productionTicketCopy";

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

// Mismos colores que el Mapa de tickets: verde libre, azul gratuito, naranja pago.
const optionStyle: Record<
  TicketAccessType,
  { icon: React.ReactNode; selected: string }
> = {
  free: {
    icon: <FaLockOpen className="text-success-600" />,
    selected: "border-success-400 bg-success-50",
  },
  freeTicket: {
    icon: <FaTicketAlt className="text-primary-600" />,
    selected: "border-primary-400 bg-primary-50",
  },
  paid: {
    icon: <FaMoneyBillWave className="text-warning-600" />,
    selected: "border-warning-400 bg-warning-50",
  },
};

/** "Hasta el cierre" o una cantidad de horas. */
type DurationChoice = number | "untilClose" | "custom";

const durationChoiceOf = (
  untilClose: boolean,
  hours?: number | null,
): DurationChoice => {
  if (untilClose) return "untilClose";
  if (hours && ticketDurationPresets.some((p) => p.hours === hours)) {
    return hours;
  }
  return hours ? "custom" : 24;
};

/**
 * Page de Ticket (staff): elige cómo se entra a un destino (carpeta, archivo
 * o blog): libre, con ticket gratuito o con ticket pago, y por cuánto tiempo.
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
  const [accessType, setAccessType] = useState<TicketAccessType>("free");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState<DurationChoice>(24);
  const [customHours, setCustomHours] = useState("48");
  const [busy, setBusy] = useState(false);
  // Sin contenido no se puede pasar a pago (un ticket que ya es pago se puede
  // seguir editando).
  const paidBlocked = hasContent === false && !existing?.isPaid;
  const isPaid = accessType === "paid";
  const hasTicket = accessType !== "free";
  const where = targetId ? "este elemento" : "el blog";

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
        setExisting(own ?? null);
        setAccessType(own ? (own.isPaid ? "paid" : "freeTicket") : "free");
        setPrice(own?.price ? String(own.price) : "");
        setDuration(durationChoiceOf(!!own?.untilClose, own?.durationHours));
        setCustomHours(own?.durationHours ? String(own.durationHours) : "48");
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

  const removeTicket = async () => {
    if (!existing) return true;
    const res = await deleteProductionTicket(existing._id);
    if (isProductionActionError(res)) {
      toastifyError(res.error);
      return false;
    }
    toastifySuccess(`Listo: ${where} quedó libre, sin ticket`);
    return true;
  };

  const handleSave = async () => {
    if (!hasTicket) {
      setBusy(true);
      try {
        if (await removeTicket()) {
          if (existing) onChanged();
          onOpenChange(false);
        }
      } finally {
        setBusy(false);
      }
      return;
    }

    if (isPaid && (!price || Number(price) <= 0)) {
      toastifyError("Poné un precio mayor a 0 para el ticket pago");
      return;
    }
    const hours =
      duration === "untilClose"
        ? undefined
        : duration === "custom"
          ? Number(customHours)
          : duration;
    if (hours !== undefined && !(hours >= 24)) {
      toastifyError("El acceso tiene que durar al menos 24 horas");
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
      const config = {
        isPaid,
        price: isPaid ? Number(price) : undefined,
        durationHours: hours,
        untilClose: duration === "untilClose",
      };
      const res = existing
        ? await updateProductionTicket(existing._id, config)
        : await createProductionTicket({ productionId, targetId, ...config });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(
        isPaid
          ? "Listo: para entrar hay que comprar el ticket"
          : "Listo: para entrar hay que sacar el ticket gratuito",
      );
      onChanged();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  const priceNum = Number(price);
  const creatorShare = Math.round(priceNum * (100 - commission)) / 100;
  const commissionShare = Math.round(priceNum * commission) / 100;
  const stats = existing?.stats;

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
            <ModalHeader className="flex flex-col gap-1">
              <span>¿Cómo se entra?</span>
              <span className="text-sm font-normal text-default-500">
                {targetName || "Todo el blog"}
              </span>
            </ModalHeader>
            <ModalBody className="gap-5">
              {loading ? (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              ) : (
                <>
                  {/* Cuánta gente sacó el ticket actual */}
                  {existing && stats && (
                    <div className="rounded-lg bg-default-100 px-3 py-2 text-sm">
                      <p>
                        <span className="font-semibold">
                          {stats.purchases}{" "}
                          {stats.purchases === 1 ? "persona" : "personas"}
                        </span>{" "}
                        {existing.isPaid
                          ? stats.purchases === 1
                            ? "compró este ticket"
                            : "compraron este ticket"
                          : stats.purchases === 1
                            ? "sacó este ticket"
                            : "sacaron este ticket"}{" "}
                        · {stats.active} con acceso vigente
                      </p>
                      {existing.isPaid && stats.revenue > 0 && (
                        <p className="text-xs text-default-500">
                          Te quedaron {existing.currency}{" "}
                          {formatMoney(stats.netRevenue)} (vendido{" "}
                          {formatMoney(stats.revenue)} − comisión{" "}
                          {formatMoney(stats.commission)})
                        </p>
                      )}
                    </div>
                  )}

                  {/* 1. Tipo de acceso */}
                  <div
                    role="radiogroup"
                    aria-label="Tipo de acceso"
                    className="flex flex-col gap-2"
                  >
                    {ticketAccessOptions.map((option) => {
                      const selected = accessType === option.key;
                      const disabled = option.key === "paid" && paidBlocked;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={disabled}
                          onClick={() => setAccessType(option.key)}
                          className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                            selected
                              ? optionStyle[option.key].selected
                              : "border-default-200 hover:border-default-400"
                          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          <span className="mt-1 text-lg">
                            {optionStyle[option.key].icon}
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-semibold">
                              {option.label}
                            </span>
                            <span className="block text-xs text-default-600">
                              {option.description}
                            </span>
                          </span>
                          {selected && (
                            <FaCheckCircle className="mt-1 text-default-700" />
                          )}
                        </button>
                      );
                    })}
                    {paidBlocked && (
                      <p className="text-xs text-warning-700">
                        Para cobrar, primero subí al menos un archivo o artículo
                        a {where}.
                      </p>
                    )}
                    {!hasTicket && targetId && (
                      <p className="text-xs text-default-500">
                        Si la carpeta que lo contiene o el blog tienen ticket,
                        se usa ese.
                      </p>
                    )}
                    {hasTicket && targetId && (
                      <p className="text-xs text-default-500">
                        Si es una carpeta, todo lo que tiene adentro usa este
                        ticket, salvo lo que tenga uno propio.
                      </p>
                    )}
                  </div>

                  {/* 2. Precio y cobro (sólo pago) */}
                  {isPaid && (
                    <div className="flex flex-col gap-3">
                      <Input
                        type="number"
                        label="Precio del ticket"
                        startContent={
                          <span className="text-sm text-default-500">$</span>
                        }
                        value={price}
                        onValueChange={setPrice}
                        min={0}
                      />
                      {priceNum > 0 && (
                        <div className="rounded-lg border border-default-200 p-3 text-sm">
                          <p className="mb-1 font-medium">
                            Cada venta se paga con dos transferencias del
                            comprador:
                          </p>
                          <p>
                            · ${formatMoney(creatorShare)} a vos (
                            {100 - commission}%)
                          </p>
                          <p>
                            · ${formatMoney(commissionShare)} a Soonpublicité (
                            {commission}% de comisión)
                          </p>
                        </div>
                      )}
                      {canManagePayout ? (
                        <Input
                          label="Tu alias o CBU/CVU"
                          description="Donde te transfieren tu parte. Vale para todos los tickets del blog."
                          value={aliasCbu}
                          onValueChange={setAliasCbu}
                        />
                      ) : (
                        !currentAlias && (
                          <p className="text-xs text-warning-700">
                            Falta el alias/CBU de cobro; sólo el admin del blog
                            puede cargarlo.
                          </p>
                        )
                      )}
                      <p className="text-xs text-default-500">
                        Cuando te llegue la transferencia, habilitá el acceso
                        desde &quot;Ventas de tickets&quot;.
                      </p>
                    </div>
                  )}

                  {/* 3. Duración (cualquier ticket) */}
                  {hasTicket && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium">
                        ¿Cuánto dura el acceso de cada persona?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ticketDurationPresets.map((preset) => (
                          <Button
                            key={preset.hours}
                            size="sm"
                            radius="full"
                            variant={
                              duration === preset.hours ? "solid" : "bordered"
                            }
                            color={
                              duration === preset.hours ? "primary" : "default"
                            }
                            onPress={() => setDuration(preset.hours)}
                          >
                            {preset.label}
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          radius="full"
                          variant={
                            duration === "untilClose" ? "solid" : "bordered"
                          }
                          color={
                            duration === "untilClose" ? "primary" : "default"
                          }
                          onPress={() => setDuration("untilClose")}
                        >
                          Sin vencimiento
                        </Button>
                        <Button
                          size="sm"
                          radius="full"
                          variant={duration === "custom" ? "solid" : "bordered"}
                          color={duration === "custom" ? "primary" : "default"}
                          onPress={() => setDuration("custom")}
                        >
                          Otro
                        </Button>
                      </div>
                      {duration === "custom" && (
                        <Input
                          type="number"
                          label="Horas (mínimo 24)"
                          value={customHours}
                          onValueChange={setCustomHours}
                          min={24}
                          description={
                            Number(customHours) >= 24
                              ? `= ${formatTicketHours(Number(customHours))}`
                              : undefined
                          }
                        />
                      )}
                      <p className="text-xs text-default-500">
                        {duration === "untilClose"
                          ? "El acceso no vence mientras el blog exista."
                          : `Se cuenta desde que ${
                              isPaid ? "habilitás el pago" : "saca el ticket"
                            }. Cuando vence, tiene que sacar uno nuevo.`}
                      </p>
                    </div>
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} isDisabled={busy}>
                Cancelar
              </Button>
              <PrimaryButton onClick={handleSave} disabled={busy || loading}>
                {busy ? "Guardando…" : "Guardar"}
              </PrimaryButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TicketManagerModal;
