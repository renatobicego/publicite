"use client";

import {
  Button,
  Chip,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";

import { getPlanGiftsAdmin } from "@/services/planGiftServices";
import {
  AdminPlanGift,
  monthsLabel,
  PLAN_GIFT_STATUS_COLOR,
  PLAN_GIFT_STATUS_LABEL,
} from "@/types/planGiftTypes";
import { formatPaymentDate } from "@/utils/functions/packs";
import { toastifyError } from "@/utils/functions/toastify";

const PAGE_SIZE = 30;

const money = (value: number) =>
  `$${value.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;

/*
Registro de los regalos de planes (sólo lectura). Las devoluciones se hacen
desde el panel de MercadoPago con el id de pago: el webhook pasa el regalo a
"Devuelto" y, si estaba activo, le quita el plan.
*/
export default function AdminPlanGiftsTable() {
  const [gifts, setGifts] = useState<AdminPlanGift[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (nextPage: number) => {
    setLoading(true);
    const response = await getPlanGiftsAdmin(nextPage, PAGE_SIZE);
    setLoading(false);
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    setGifts((prev) => (nextPage === 1 ? response.gifts : [...prev, ...response.gifts]));
    setHasMore(response.hasMore);
    setPage(nextPage);
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">
        Cada regalo es un pago único. Para devolverlo, buscá el id de pago en
        MercadoPago: al confirmarse la devolución el regalo pasa a «Devuelto» y,
        si estaba activo, se le quita el plan a quien lo recibió.
      </p>
      <Table aria-label="Regalos de planes" isStriped>
        <TableHeader>
          <TableColumn>Fecha</TableColumn>
          <TableColumn>Regalo</TableColumn>
          <TableColumn>Monto</TableColumn>
          <TableColumn>Quién regala</TableColumn>
          <TableColumn>Para</TableColumn>
          <TableColumn>Estado</TableColumn>
          <TableColumn>Vence</TableColumn>
          <TableColumn>Pago en MP</TableColumn>
          <TableColumn>Código</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={loading ? <Spinner /> : "Todavía no hay regalos."}
          items={gifts}
        >
          {(gift) => (
            <TableRow key={gift._id}>
              <TableCell>{formatPaymentDate(gift.createdAt) ?? "—"}</TableCell>
              <TableCell>
                {monthsLabel(gift.months)} de {gift.planReason}
              </TableCell>
              <TableCell>{money(gift.amount)}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{gift.giverName ?? "—"}</span>
                  <span className="text-tiny text-default-400">{gift.giverEmail}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{gift.recipientName ?? "Sin cuenta todavía"}</span>
                  <span className="text-tiny text-default-400">{gift.recipientEmail}</span>
                </div>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color={PLAN_GIFT_STATUS_COLOR[gift.status]}>
                  {PLAN_GIFT_STATUS_LABEL[gift.status]}
                </Chip>
              </TableCell>
              <TableCell>{formatPaymentDate(gift.expiresAt) ?? "—"}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{gift.mpPaymentId ?? "—"}</span>
                  <span className="text-tiny text-default-400">{gift.paymentStatus}</span>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-xs">{gift.code}</code>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {hasMore && (
        <Button
          className="self-center"
          radius="full"
          isLoading={loading}
          onPress={() => load(page + 1)}
        >
          Cargar más
        </Button>
      )}
    </div>
  );
}
