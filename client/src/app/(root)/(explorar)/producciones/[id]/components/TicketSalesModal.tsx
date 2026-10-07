"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  Input,
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
  useDisclosure,
} from "@nextui-org/react";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  activateProductionTicketPurchase,
  getProductionTicketSales,
  rejectProductionTicketPurchase,
} from "@/app/server/productionActions";
import {
  isProductionActionError,
  ProductionActionError,
} from "@/utils/functions/productionErrorHandler";
import {
  ProductionTicketPurchase,
  ProductionTicketPurchaseStatus,
} from "@/types/productionTypes";
import {
  commissionStatusColor,
  commissionStatusLabel,
  isAccessSuspended,
  purchaseStatusColor,
  purchaseStatusLabel,
} from "../../productionTicketStatus";
import { resolveProductionFileUrl } from "../../productionMedia";

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
 * Ventas de tickets (staff) de un contenido o de todo el blog. El comprador le
 * transfiere su parte al blog: el staff revisa el comprobante y habilita el
 * acceso (o rechaza la compra si la transferencia no llegó). La comisión la
 * controla Soonpublicité, que puede suspender el acceso si está impaga.
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
  const [busyId, setBusyId] = useState<string | null>(null);
  const rejectModal = useDisclosure();
  const [rejecting, setRejecting] = useState<ProductionTicketPurchase | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");

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

  /** Corre una acción sobre una compra y la reemplaza en la lista. */
  const run = async (
    purchaseId: string,
    action: () => Promise<ProductionTicketPurchase | ProductionActionError>,
    okMessage: string,
  ) => {
    setBusyId(purchaseId);
    try {
      const res = await action();
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return false;
      }
      setPurchases((prev) => prev.map((p) => (p._id === res._id ? res : p)));
      toastifySuccess(okMessage);
      return true;
    } finally {
      setBusyId(null);
    }
  };

  const submitReject = async () => {
    if (!rejecting) return;
    if (!rejectReason.trim()) {
      toastifyError("Indicá el motivo del rechazo");
      return;
    }
    const ok = await run(
      rejecting._id,
      () =>
        rejectProductionTicketPurchase({
          purchaseId: rejecting._id,
          reason: rejectReason.trim(),
        }),
      "Compra rechazada",
    );
    if (ok) {
      setRejectReason("");
      rejectModal.onClose();
    }
  };

  return (
    <>
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
                      <TableColumn>TE TRANSFIEREN</TableColumn>
                      <TableColumn>COMISIÓN SOONPUBLICITÉ</TableColumn>
                      <TableColumn>ACCIONES</TableColumn>
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
                            {isAccessSuspended(p) && (
                              <span className="block text-xs text-danger mt-1">
                                Suspendida por Soonpublicité
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {p.isPaid
                              ? `${p.currency} ${formatMoney(p.amount)}`
                              : "Gratuito"}
                          </TableCell>
                          <TableCell>
                            {p.isPaid && p.creatorPayoutAmount != null
                              ? `${p.currency} ${formatMoney(
                                p.creatorPayoutAmount,
                              )}`
                              : "-"}
                            {p.transferReceiptKey && (
                              <a
                                href={resolveProductionFileUrl(
                                  p.transferReceiptKey,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-primary underline"
                              >
                                Ver comprobante
                              </a>
                            )}
                            {p.transferReference && (
                              <span className="block text-xs text-default-500">
                                Ref.: {p.transferReference}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {p.isPaid && p.commissionAmount != null ? (
                              <>
                                {p.currency} {formatMoney(p.commissionAmount)}
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  className="ml-2"
                                  color={
                                    commissionStatusColor[p.commissionStatus]
                                  }
                                >
                                  {commissionStatusLabel[p.commissionStatus]}
                                </Chip>
                              </>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {p.status ===
                            ProductionTicketPurchaseStatus.pending ? (
                              <div className="flex flex-wrap gap-1">
                                <Button
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  isDisabled={
                                    busyId === p._id || isAccessSuspended(p)
                                  }
                                  onPress={() =>
                                    run(
                                      p._id,
                                      () =>
                                        activateProductionTicketPurchase(p._id),
                                      "Acceso habilitado",
                                    )
                                  }
                                >
                                  Habilitar
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  isDisabled={busyId === p._id}
                                  onPress={() => {
                                    setRejecting(p);
                                    setRejectReason("");
                                    rejectModal.onOpen();
                                  }}
                                >
                                  Rechazar
                                </Button>
                              </div>
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
      <Modal
        isOpen={rejectModal.isOpen}
        onOpenChange={rejectModal.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Rechazar compra</ModalHeader>
              <ModalBody>
                <p className="text-sm text-default-600">
                  Rechazá la compra sólo si la transferencia no te llegó. El
                  comprador va a recibir el motivo.
                </p>
                <Input
                  label="Motivo del rechazo"
                  value={rejectReason}
                  onValueChange={setRejectReason}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="danger"
                  onPress={submitReject}
                  isLoading={!!rejecting && busyId === rejecting._id}
                >
                  Rechazar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default TicketSalesModal;
