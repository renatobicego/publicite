import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@nextui-org/react";
import { getPayments } from "@/services/subscriptionServices";
import { toastifyError } from "@/utils/functions/toastify";
import { PaymentMethod } from "@/types/subscriptions";
import { getPaymentDetails, getPaymentIcon } from "@/utils/functions/payments";
import { parseZonedDateTime } from "@internationalized/date";

export default function PaymentsTable() {
  const [loadingState, setLoadingState] = useState<"loading" | "idle">("idle");
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      setLoadingState("loading");
      const res = await getPayments();
      setLoadingState("idle");
      if (res?.error) {
        toastifyError(res.error);
        return;
      }
      if (!res) return;
      console.log(res);
      setData(res);
    };

    fetchData();
  }, []);

  const renderCell = useCallback(
    (data: PaymentMethod, columnKey: keyof PaymentMethod) => {
      switch (columnKey) {
        case "timeOfUpdate":
          const date = parseZonedDateTime(data?.timeOfUpdate);
          return (
            <p className="max-w-16">{`${date.hour}:${date.minute} ${date.day}/${date.month}/${date.year}`}</p>
          );
        case "paymentMethodId":
          const icon = getPaymentIcon(data?.paymentMethodId as string);
          return (
            <div className="flex gap-1 items-center">
              {icon}
              {data.paymentTypeId === "credit_card" ? "Crédito" : "Débito"}
            </div>
          );
        case "status":
          const status = data?.status;
          if (status === "approved") return "Aprobado";
          if (status === "authorized") return "Autorizado";
          if (status === "pending") return "En Proceso";
          if (status === "rejected") return "Rechazado";
          if (status === "cancelled") return "Pausado";
        case "status_detail":
          return (
            <p className="profile-paragraph min-w-32">
              {getPaymentDetails(data?.status_detail)}
            </p>
          );
        case "transactionAmount":
          return "$" + data?.transactionAmount;
        default:
          return;
      }
    },
    []
  );

  return (
    <Table aria-label="Example table with client async pagination">
      <TableHeader>
        <TableColumn key="timeOfUpdate">Fecha</TableColumn>
        <TableColumn key="paymentMethodId">Método de Pago</TableColumn>
        <TableColumn key="status">Estado</TableColumn>
        <TableColumn key="status_detail">Detalle</TableColumn>
        <TableColumn key="transactionAmount">Monto</TableColumn>
      </TableHeader>
      <TableBody
        items={data}
        loadingContent={<Spinner />}
        loadingState={loadingState}
      >
        {(item: PaymentMethod) => (
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
