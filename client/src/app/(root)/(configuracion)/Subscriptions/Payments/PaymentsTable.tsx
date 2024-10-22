import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  getKeyValue,
} from "@nextui-org/react";
import { getPayments } from "@/services/subscriptionServices";
export default function PaymentsTable() {
  const [loadingState, setLoadingState] = useState<"loading" | "idle">("idle");
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      setLoadingState("loading");
      const res = await getPayments();
      console.log(res)
      setLoadingState("idle");
    }

    fetchData()
  }, [])

  return (
    <Table aria-label="Example table with client async pagination">
      <TableHeader>
        <TableColumn key="dateApproved">Fecha de Pago</TableColumn>
        <TableColumn key="name">Name</TableColumn>
        <TableColumn key="height">Height</TableColumn>
        <TableColumn key="mass">Mass</TableColumn>
      </TableHeader>
      <TableBody
        items={[]}
        loadingContent={<Spinner />}
        loadingState={loadingState}
      >
        {(item: any) => (
          <TableRow key={item?.name}>
            {(columnKey) => (
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
