import { ProductionTicketPurchaseStatus } from "@/types/productionTypes";

export const purchaseStatusLabel: Record<
  ProductionTicketPurchaseStatus,
  string
> = {
  [ProductionTicketPurchaseStatus.pending]: "Pendiente",
  [ProductionTicketPurchaseStatus.confirmed]: "Confirmada",
  [ProductionTicketPurchaseStatus.active]: "Activa",
  [ProductionTicketPurchaseStatus.expired]: "Vencida",
  [ProductionTicketPurchaseStatus.rejected]: "Rechazada",
  [ProductionTicketPurchaseStatus.cancelled]: "Cancelada",
};

export const purchaseStatusColor: Record<
  ProductionTicketPurchaseStatus,
  "default" | "primary" | "secondary" | "success" | "warning" | "danger"
> = {
  [ProductionTicketPurchaseStatus.pending]: "warning",
  [ProductionTicketPurchaseStatus.confirmed]: "secondary",
  [ProductionTicketPurchaseStatus.active]: "success",
  [ProductionTicketPurchaseStatus.expired]: "default",
  [ProductionTicketPurchaseStatus.rejected]: "danger",
  [ProductionTicketPurchaseStatus.cancelled]: "default",
};
