"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { toastifyError } from "@/utils/functions/toastify";
import { getProductionTicketSales } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionPayoutStatus,
  ProductionTicketPurchase,
} from "@/types/productionTypes";
import {
  purchaseStatusColor,
  purchaseStatusLabel,
} from "../../productionTicketStatus";

const PAGE_SIZE = 20;

interface Props {
  productionId: string;
  /** Carpeta, archivo o artículo; vacío = todas las ventas del blog. */
  targetId?: string;
  targetName?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatMoney = (value?: number | null) =>
  (value ?? 0).toLocaleString("es-AR", { maximumFractionDigits: 2 });

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("es-AR") : "-";

/**
 * Ventas de tickets (staff) de un contenido o de todo el blog: cada compra con
 * su comisión, lo que le toca al creador, si Soonpublicité ya lo liquidó y la
 * factura de la comisión.
 */
const TicketSalesModal = ({
  productionId,
  targetId,
  targetName,
  isOpen,
  onOpenChange,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [purchases, setPurchases] = useState<ProductionTicketPurchase[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);
    (async () => {
      const res = await getProductionTicketSales(
        productionId,
        undefined,
        1,
        PAGE_SIZE,
        targetId,
      );
      if (!active) return;
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        setPurchases([]);
        setHasMore(false);
      } else {
        setPurchases(res.purchases);
        setHasMore(res.hasMore);
      }
      setPage(1);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isOpen, productionId, targetId]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await getProductionTicketSales(
        productionId,
        undefined,
        page + 1,
        PAGE_SIZE,
        targetId,
      );
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      setPurchases((prev) => [...prev, ...res.purchases]);
      setHasMore(res.hasMore);
      setPage(page + 1);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderPayout = (p: ProductionTicketPurchase) => {
    if (!p.isPaid) return "-";
    if (p.payoutStatus === ProductionPayoutStatus.paid) {
      return (
        <Chip size="sm" variant="flat" color="success">
          Pagado el {formatDate(p.payoutAt)}
        </Chip>
      );
    }
    if (p.payoutStatus === ProductionPayoutStatus.pending) {
      return (
        <Chip size="sm" variant="flat" color="warning">
          Pendiente de pago
        </Chip>
      );
    }
    return "-";
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              Ventas de tickets · {targetName || "Todo el blog"}
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Table aria-label="Ventas de tickets" removeWrapper>
                    <TableHeader>
                      <TableColumn>CONTENIDO</TableColumn>
                      <TableColumn>COMPRADOR</TableColumn>
                      <TableColumn>FECHA</TableColumn>
                      <TableColumn>ESTADO</TableColumn>
                      <TableColumn>PRECIO</TableColumn>
                      <TableColumn>COMISIÓN</TableColumn>
                      <TableColumn>TE CORRESPONDE</TableColumn>
                      <TableColumn>PAGO DE SOONPUBLICITÉ</TableColumn>
                      <TableColumn>FACTURA</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="Todavía no hay ventas de tickets.">
                      {purchases.map((p) => (
                        <TableRow key={p._id}>
                          <TableCell>
                            {p.targetName || "Todo el blog"}
                          </TableCell>
                          <TableCell>
                            {p.buyerInfo?.username || p.buyer.slice(-6)}
                          </TableCell>
                          <TableCell>{formatDate(p.createdAt)}</TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              variant="flat"
                              color={purchaseStatusColor[p.status]}
                            >
                              {purchaseStatusLabel[p.status]}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {p.isPaid
                              ? `${p.currency} ${formatMoney(p.amount)}`
                              : "Gratuito"}
                          </TableCell>
                          <TableCell>
                            {p.isPaid && p.commissionAmount != null
                              ? `${p.currency} ${formatMoney(
                                p.commissionAmount,
                              )}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {p.isPaid && p.creatorPayoutAmount != null
                              ? `${p.currency} ${formatMoney(
                                p.creatorPayoutAmount,
                              )}`
                              : "-"}
                          </TableCell>
                          <TableCell>{renderPayout(p)}</TableCell>
                          <TableCell>
                            {p.facturaUrl ? (
                              <a
                                href={p.facturaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                              >
                                Ver factura
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {hasMore && (
                    <Button
                      size="sm"
                      variant="flat"
                      className="self-center"
                      onPress={loadMore}
                      isLoading={loadingMore}
                    >
                      Ver más
                    </Button>
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TicketSalesModal;
