import {
  ProductionCommissionStatus,
  ProductionTicketPurchase,
  ProductionTicketPurchaseStatus,
} from "@/types/productionTypes";

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

export const purchaseStatusLabel: Record<
  ProductionTicketPurchaseStatus,
  string
> = {
  [ProductionTicketPurchaseStatus.pending]: "Pendiente",
  [ProductionTicketPurchaseStatus.active]: "Activa",
  [ProductionTicketPurchaseStatus.expired]: "Vencida",
  [ProductionTicketPurchaseStatus.rejected]: "Rechazada",
  [ProductionTicketPurchaseStatus.cancelled]: "Cancelada",
};

export const purchaseStatusColor: Record<
  ProductionTicketPurchaseStatus,
  ChipColor
> = {
  [ProductionTicketPurchaseStatus.pending]: "warning",
  [ProductionTicketPurchaseStatus.active]: "success",
  [ProductionTicketPurchaseStatus.expired]: "default",
  [ProductionTicketPurchaseStatus.rejected]: "danger",
  [ProductionTicketPurchaseStatus.cancelled]: "default",
};

/** Comisión que el comprador le transfiere a Soonpublicité. */
export const commissionStatusLabel: Record<ProductionCommissionStatus, string> =
  {
    [ProductionCommissionStatus.notApplicable]: "-",
    [ProductionCommissionStatus.pending]: "A verificar",
    [ProductionCommissionStatus.paid]: "Cobrada",
    [ProductionCommissionStatus.unpaid]: "Impaga",
  };

export const commissionStatusColor: Record<
  ProductionCommissionStatus,
  ChipColor
> = {
  [ProductionCommissionStatus.notApplicable]: "default",
  [ProductionCommissionStatus.pending]: "warning",
  [ProductionCommissionStatus.paid]: "success",
  [ProductionCommissionStatus.unpaid]: "danger",
};

/**
 * Soonpublicité suspende el acceso mientras la comisión está impaga, aunque el
 * blog ya lo haya habilitado.
 */
export const isAccessSuspended = (purchase: ProductionTicketPurchase) =>
  purchase.commissionStatus === ProductionCommissionStatus.unpaid &&
  (purchase.status === ProductionTicketPurchaseStatus.pending ||
    purchase.status === ProductionTicketPurchaseStatus.active);
