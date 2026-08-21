"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@nextui-org/react";
import { FaDownload, FaFileInvoice, FaUpload } from "react-icons/fa6";

import { getAllInvoicesAdmin } from "@/services/adminServices";
import {
  AdminInvoice,
  AdminInvoiceFilters,
  PAYMENT_STATUS_LABELS,
} from "@/types/adminTypes";
import { getPaymentIcon } from "@/utils/functions/payments";
import { formatAdminDate } from "@/utils/functions/adminInvoices";
import { toastifyError } from "@/utils/functions/toastify";
import AdminInvoiceFiltersBar from "./AdminInvoiceFilters";
import AttachFacturaModal from "./AttachFacturaModal";

const ROWS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 400;

const STATUS_COLORS: Record<
  string,
  "success" | "warning" | "danger" | "default"
> = {
  approved: "success",
  authorized: "success",
  pending: "warning",
  rejected: "danger",
  cancelled: "default",
};

export default function AdminInvoicesTable() {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AdminInvoiceFilters>({});
  const [loadingState, setLoadingState] = useState<"loading" | "idle">("loading");
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(
    null
  );

  const pages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));

  // La paginación es server-side: cada página es una query nueva. El debounce
  // es por el filtro de usuario, que se escribe letra por letra.
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoadingState("loading");
      const res = await getAllInvoicesAdmin(page, ROWS_PER_PAGE, filters);
      if (cancelled) return;

      setLoadingState("idle");
      if ("error" in res) {
        toastifyError(res.error);
        return;
      }
      setInvoices(res.invoices);
      setTotal(res.total);
    };

    const timeout = setTimeout(fetchData, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [page, filters]);

  const handleFiltersChange = useCallback((next: AdminInvoiceFilters) => {
    // Cambiar un filtro estando en la página 5 mostraría una página vacía.
    setPage(1);
    setFilters(next);
  }, []);

  const handleFacturaSaved = useCallback(
    (invoiceId: string, facturaUrl: string, uploadedAt: string) => {
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice._id === invoiceId
            ? { ...invoice, facturaUrl, facturaUploadedAt: uploadedAt }
            : invoice
        )
      );
    },
    []
  );

  const renderCell = useCallback((invoice: AdminInvoice, columnKey: string) => {
    switch (columnKey) {
      case "timeOfUpdate":
        return (
          <p className="whitespace-nowrap text-xs">
            {formatAdminDate(invoice.timeOfUpdate)}
          </p>
        );

      case "user":
        return (
          <div className="min-w-32">
            <p className="text-sm font-medium">{invoice.userName}</p>
            {invoice.userEmail && (
              <p className="text-xs text-default-500">{invoice.userEmail}</p>
            )}
          </div>
        );

      case "reason":
        return <p className="min-w-28 text-sm">{invoice.reason ?? "-"}</p>;

      case "paymentId": {
        if (!invoice.paymentId) return "-";
        const { paymentMethodId, paymentTypeId } = invoice.paymentId;
        return (
          <div className="flex gap-1 items-center text-sm">
            {getPaymentIcon(paymentMethodId)}
            {paymentTypeId === "credit_card" ? "Crédito" : "Débito"}
          </div>
        );
      }

      case "paymentStatus":
        return (
          <Chip
            size="sm"
            variant="flat"
            color={STATUS_COLORS[invoice.paymentStatus] ?? "default"}
          >
            {PAYMENT_STATUS_LABELS[invoice.paymentStatus] ??
              invoice.paymentStatus}
          </Chip>
        );

      case "transactionAmount":
        return (
          <p className="whitespace-nowrap">${invoice.transactionAmount}</p>
        );

      case "comprobante":
        // El comprobante lo genera el backend y sólo existe para pagos aprobados.
        if (invoice.paymentStatus !== "approved") return "-";
        return (
          <Tooltip content="Descargar comprobante (PDF)">
            <a
              href={`/api/invoices/${invoice._id}/ticket`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center text-secondary hover:opacity-70"
              aria-label="Descargar comprobante"
            >
              <FaDownload />
            </a>
          </Tooltip>
        );

      case "factura":
        if (!invoice.facturaUrl) {
          return <span className="text-default-400">-</span>;
        }
        return (
          <Tooltip
            content={`Cargada el ${formatAdminDate(invoice.facturaUploadedAt)}`}
          >
            <a
              href={invoice.facturaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center text-secondary hover:opacity-70"
              aria-label="Ver factura"
            >
              <FaFileInvoice />
            </a>
          </Tooltip>
        );

      case "acciones":
        return (
          <Button
            size="sm"
            variant="flat"
            radius="full"
            color="secondary"
            startContent={<FaUpload size={12} />}
            onPress={() => setSelectedInvoice(invoice)}
          >
            {invoice.facturaUrl ? "Reemplazar" : "Subir"}
          </Button>
        );

      default:
        return null;
    }
  }, []);

  const bottomContent = useMemo(
    () => (
      <div className="flex w-full items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-default-500">
          {total} {total === 1 ? "ticket" : "tickets"}
        </p>
        <Pagination
          isCompact
          showControls
          showShadow
          color="secondary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="w-16" />
      </div>
    ),
    [page, pages, total]
  );

  return (
    <>
      <AdminInvoiceFiltersBar
        filters={filters}
        onChange={handleFiltersChange}
        isLoading={loadingState === "loading"}
      />

      <Table
        aria-label="Tabla de tickets de todos los usuarios"
        bottomContent={bottomContent}
      >
        <TableHeader>
          <TableColumn key="timeOfUpdate">Fecha</TableColumn>
          <TableColumn key="user">Usuario</TableColumn>
          <TableColumn key="reason">Detalle</TableColumn>
          <TableColumn key="paymentId">Método</TableColumn>
          <TableColumn key="paymentStatus">Estado</TableColumn>
          <TableColumn key="transactionAmount">Monto</TableColumn>
          <TableColumn key="comprobante">Comp.</TableColumn>
          <TableColumn key="factura">Factura</TableColumn>
          <TableColumn key="acciones">Acción</TableColumn>
        </TableHeader>
        <TableBody
          items={invoices}
          loadingContent={<Spinner />}
          loadingState={loadingState}
          emptyContent="No se encontraron tickets"
        >
          {(invoice: AdminInvoice) => (
            <TableRow key={invoice._id}>
              {(columnKey: any) => (
                <TableCell>{renderCell(invoice, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AttachFacturaModal
        invoice={selectedInvoice}
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onSaved={handleFacturaSaved}
      />
    </>
  );
}
