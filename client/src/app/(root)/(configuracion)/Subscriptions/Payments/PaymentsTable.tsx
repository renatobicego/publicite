import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Pagination,
} from "@nextui-org/react";
import { getPayments } from "@/services/subscriptionServices";
import { toastifyError } from "@/utils/functions/toastify";
import { Invoice, PaymentMethod } from "@/types/subscriptions";
import { getPaymentDetails, getPaymentIcon } from "@/utils/functions/payments";
import {
  parseAbsoluteToLocal,
  parseZonedDateTime,
} from "@internationalized/date";

export default function PaymentsTable() {
  const [loadingState, setLoadingState] = useState<"loading" | "idle">("idle");
  const [data, setData] = useState<Invoice[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  const pages = Math.ceil(data.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return data.slice(start, end);
  }, [page, data]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingState("loading");
      const res = await getPayments(page);
      setLoadingState("idle");
      if ("error" in res) {
        toastifyError(res.error);
        return;
      }
      if (!res) return;
      setData(res.invoices);
      console.log(res.invoices);
      setHasMore(res.hasMore);
    };
    if (hasMore) {
      fetchData();
    }
  }, [page, hasMore]);

  const renderCell = useCallback((data: Invoice, columnKey: keyof Invoice) => {
    switch (columnKey) {
      case "timeOfUpdate":
        const date = parseZonedDateTime(data?.timeOfUpdate);
        return (
          <p className="max-w-16">{`${date.hour}:${date.minute} ${date.day}/${date.month}/${date.year}`}</p>
        );
      case "paymentId":
        const { paymentMethodId, paymentTypeId } = data?.paymentId;
        const icon = getPaymentIcon(paymentMethodId);
        return (
          <div className="flex gap-1 items-center">
            {icon}
            {paymentTypeId === "credit_card" ? "Crédito" : "Débito"}
          </div>
        );
      case "paymentStatus":
        const status = data?.paymentStatus;
        if (status === "approved") return "Aprobado";
        if (status === "authorized") return "Autorizado";
        if (status === "pending") return "En Proceso";
        if (status === "rejected") return "Rechazado";
        if (status === "cancelled") return "Pausado";
      case "rejectionCode":
        return (
          <p className="profile-paragraph min-w-32">
            {getPaymentDetails(
              data.paymentStatus === "approved"
                ? "accredited"
                : data?.rejectionCode
            )}
          </p>
        );
      case "transactionAmount":
        return "$" + data?.transactionAmount;
      case "retryAttempts":
        return data?.retryAttempts;
      case "nextRetryDay":
        if (data.paymentStatus === "approved") return;
        const nextRetryDay = parseAbsoluteToLocal(
          data?.nextRetryDay.replace(/\.\d{3}/, "")
        );
        return (
          <p className="max-w-16">{`${nextRetryDay.hour}:${nextRetryDay.minute} ${nextRetryDay.day}/${nextRetryDay.month}/${nextRetryDay.year}`}</p>
        );
      default:
        return;
    }
  }, []);

  return (
    <Table
      aria-label="Tabla de pagos con paginación"
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="secondary"
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
        </div>
      }
    >
      <TableHeader>
        <TableColumn key="timeOfUpdate">Fecha</TableColumn>
        <TableColumn key="paymentId">Método de Pago</TableColumn>
        <TableColumn key="paymentStatus">Estado</TableColumn>
        <TableColumn key="rejectionCode">Detalle</TableColumn>
        <TableColumn key="transactionAmount">Monto</TableColumn>
        <TableColumn key="retryAttempts">Intento de Cobro</TableColumn>
        <TableColumn key="nextRetryDay">Próximo Pago</TableColumn>
      </TableHeader>
      <TableBody
        items={items}
        loadingContent={<Spinner />}
        loadingState={loadingState}
        emptyContent={"No se encontraron pagos"}
      >
        {(item: Invoice) => (
          <TableRow key={item?._id}>
            {(columnKey: any) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
