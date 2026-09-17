"use client";
import { useCallback, useEffect, useState } from "react";
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
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  getProductionTicketPurchasesAdmin,
  confirmProductionTicketPurchase,
  rejectProductionTicketPurchase,
  attachFacturaToProductionTicketPurchase,
  markProductionTicketPayoutDone,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { ProductionTicketPurchase } from "@/types/productionTypes";
import {
  purchaseStatusColor,
  purchaseStatusLabel,
} from "@/app/(root)/(explorar)/producciones/productionTicketStatus";

/**
 * Tabla de compras de tickets de Mis Producciones para el panel admin.
 * Confirmar transferencia, rechazar, adjuntar factura del 10% y liquidar el 90%.
 */
const AdminProductionTicketsTable = () => {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<ProductionTicketPurchase[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const facturaModal = useDisclosure();
  const rejectModal = useDisclosure();
  const [selected, setSelected] = useState<ProductionTicketPurchase | null>(
    null
  );
  const [facturaUrl, setFacturaUrl] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getProductionTicketPurchasesAdmin(1, 50);
    if (!isProductionActionError(res)) {
      setPurchases(res.purchases);
    } else {
      toastifyError(res.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (
    id: string,
    fn: () => Promise<unknown>,
    okMsg: string
  ) => {
    setBusyId(id);
    try {
      const res = (await fn()) as any;
      if (res && isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(okMsg);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirm = (p: ProductionTicketPurchase, activate: boolean) =>
    run(
      p._id,
      () => confirmProductionTicketPurchase(p._id, activate),
      activate ? "Confirmada y habilitada" : "Transferencia confirmada"
    );

  const handlePayout = (p: ProductionTicketPurchase) =>
    run(p._id, () => markProductionTicketPayoutDone(p._id), "Liquidación marcada");

  const submitFactura = async () => {
    if (!selected) return;
    if (!facturaUrl.trim()) {
      toastifyError("Ingresá la URL de la factura");
      return;
    }
    await run(
      selected._id,
      () =>
        attachFacturaToProductionTicketPurchase({
          purchaseId: selected._id,
          facturaUrl: facturaUrl.trim(),
        }),
      "Factura adjuntada"
    );
    setFacturaUrl("");
    facturaModal.onClose();
  };

  const submitReject = async () => {
    if (!selected) return;
    if (!rejectReason.trim()) {
      toastifyError("Indicá el motivo del rechazo");
      return;
    }
    await run(
      selected._id,
      () =>
        rejectProductionTicketPurchase({
          purchaseId: selected._id,
          reason: rejectReason.trim(),
        }),
      "Compra rechazada"
    );
    setRejectReason("");
    rejectModal.onClose();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Table aria-label="Compras de tickets de Producciones">
        <TableHeader>
          <TableColumn>BLOG</TableColumn>
          <TableColumn>COMPRADOR</TableColumn>
          <TableColumn>MONTO</TableColumn>
          <TableColumn>10% / 90%</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No hay compras de tickets.">
          {purchases.map((p) => (
            <TableRow key={p._id}>
              <TableCell>{p.productionTitle}</TableCell>
              <TableCell>
                {p.buyerInfo?.username ||
                  p.buyerInfo?.email ||
                  p.buyer.slice(-6)}
              </TableCell>
              <TableCell>
                {p.isPaid ? `${p.currency} ${p.amount}` : "Gratuito"}
              </TableCell>
              <TableCell>
                {p.commissionAmount != null && p.creatorPayoutAmount != null
                  ? `${p.commissionAmount} / ${p.creatorPayoutAmount}`
                  : "-"}
              </TableCell>
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
                <div className="flex flex-wrap gap-1">
                  {p.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        isDisabled={busyId === p._id}
                        onPress={() => handleConfirm(p, true)}
                      >
                        Confirmar + habilitar
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        isDisabled={busyId === p._id}
                        onPress={() => {
                          setSelected(p);
                          rejectModal.onOpen();
                        }}
                      >
                        Rechazar
                      </Button>
                    </>
                  )}
                  {p.isPaid && !p.facturaUrl && (
                    <Button
                      size="sm"
                      variant="flat"
                      isDisabled={busyId === p._id}
                      onPress={() => {
                        setSelected(p);
                        facturaModal.onOpen();
                      }}
                    >
                      Factura 10%
                    </Button>
                  )}
                  {p.isPaid && p.payoutStatus !== "done" && (
                    <Button
                      size="sm"
                      variant="flat"
                      isDisabled={busyId === p._id}
                      onPress={() => handlePayout(p)}
                    >
                      Liquidar 90%
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={facturaModal.isOpen} onOpenChange={facturaModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Adjuntar factura del 10%</ModalHeader>
              <ModalBody>
                <Input
                  label="URL de la factura (PDF/imagen)"
                  value={facturaUrl}
                  onValueChange={setFacturaUrl}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <PrimaryButton onClick={submitFactura}>Guardar</PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={rejectModal.isOpen} onOpenChange={rejectModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Rechazar compra</ModalHeader>
              <ModalBody>
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
                <Button color="danger" onPress={submitReject}>
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

export default AdminProductionTicketsTable;
