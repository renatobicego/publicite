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
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  getProductionTicketPurchasesAdmin,
  setProductionTicketCommissionStatus,
  rejectProductionTicketPurchaseAsAdmin,
  attachFacturaToProductionTicketPurchase,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionCommissionStatus,
  ProductionTicketPurchase,
  ProductionTicketPurchaseStatus,
} from "@/types/productionTypes";
import { useUploadThing } from "@/utils/uploadThing";
import { resolveProductionFileUrl } from "@/app/(root)/(explorar)/producciones/productionMedia";
import {
  commissionStatusColor,
  commissionStatusLabel,
  isAccessSuspended,
  purchaseStatusColor,
  purchaseStatusLabel,
} from "@/app/(root)/(explorar)/producciones/productionTicketStatus";

const FACTURA_ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];
const FACTURA_MAX_SIZE_MB = 8;

// El server sólo deja controlar la comisión de compras que no se cerraron
// sin acceso (rechazadas o canceladas).
const COMMISSION_STATUSES = [
  ProductionTicketPurchaseStatus.pending,
  ProductionTicketPurchaseStatus.active,
  ProductionTicketPurchaseStatus.expired,
];

/**
 * Tabla de compras de tickets de Mis Producciones para el panel admin. El
 * acceso lo habilita el blog; acá Soonpublicité controla la comisión que le
 * transfirió el comprador: la marca cobrada o impaga (impaga suspende el
 * acceso hasta que se pague) y le adjunta la factura.
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
  const [facturaFile, setFacturaFile] = useState<File | null>(null);
  const [isUploadingFactura, setIsUploadingFactura] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { startUpload } = useUploadThing("uploadSingleFile", {
    onUploadError: (e) =>
      toastifyError(`Error al subir la factura: ${e.message}`),
  });

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

  const handleCommission = (
    p: ProductionTicketPurchase,
    status: ProductionCommissionStatus
  ) =>
    run(
      p._id,
      () => setProductionTicketCommissionStatus(p._id, status),
      status === ProductionCommissionStatus.paid
        ? "Comisión marcada como cobrada"
        : "Comisión impaga: acceso suspendido"
    );

  const handleFacturaFileChange = (file: File | null) => {
    if (!file) {
      setFacturaFile(null);
      return;
    }
    if (!FACTURA_ACCEPTED_TYPES.includes(file.type)) {
      toastifyError("La factura tiene que ser un PDF o una imagen");
      return;
    }
    if (file.size > FACTURA_MAX_SIZE_MB * 1024 * 1024) {
      toastifyError(`El archivo no puede superar los ${FACTURA_MAX_SIZE_MB}MB`);
      return;
    }
    setFacturaFile(file);
  };

  const submitFactura = async () => {
    if (!selected || !facturaFile) return;
    setIsUploadingFactura(true);
    try {
      const uploaded = await startUpload([facturaFile]);
      const url = uploaded?.[0]?.ufsUrl ?? uploaded?.[0]?.url;
      if (!url) {
        toastifyError("No se pudo subir la factura. Intentá de nuevo.");
        return;
      }
      await run(
        selected._id,
        () =>
          attachFacturaToProductionTicketPurchase({
            purchaseId: selected._id,
            facturaUrl: url,
          }),
        "Factura adjuntada"
      );
      setFacturaFile(null);
      facturaModal.onClose();
    } catch {
      toastifyError("Error al guardar la factura. Intentá de nuevo.");
    } finally {
      setIsUploadingFactura(false);
    }
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
        rejectProductionTicketPurchaseAsAdmin({
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
          <TableColumn>PRECIO</TableColumn>
          <TableColumn>COMISIÓN (SOONPUBLICITÉ)</TableColumn>
          <TableColumn>PARTE DEL BLOG</TableColumn>
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
                {p.transferReference && (
                  <span className="block text-xs text-default-500">
                    Ref.: {p.transferReference}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {p.isPaid && p.commissionAmount != null ? (
                  <>
                    {p.currency} {p.commissionAmount}
                    <Chip
                      size="sm"
                      variant="flat"
                      className="ml-2"
                      color={commissionStatusColor[p.commissionStatus]}
                    >
                      {commissionStatusLabel[p.commissionStatus]}
                    </Chip>
                  </>
                ) : (
                  "-"
                )}
                {p.commissionReceiptKey && (
                  <a
                    href={resolveProductionFileUrl(p.commissionReceiptKey)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-primary underline"
                  >
                    Ver comprobante
                  </a>
                )}
                {p.facturaUrl && (
                  <a
                    href={p.facturaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-primary underline"
                  >
                    Ver factura
                  </a>
                )}
              </TableCell>
              <TableCell>
                {p.isPaid && p.creatorPayoutAmount != null
                  ? `${p.currency} ${p.creatorPayoutAmount}`
                  : "-"}
                {p.payoutAliasCbu && (
                  <span className="block text-xs text-default-500">
                    Alias/CBU: {p.payoutAliasCbu}
                  </span>
                )}
                {p.transferReceiptKey && (
                  <a
                    href={resolveProductionFileUrl(p.transferReceiptKey)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-primary underline"
                  >
                    Ver comprobante
                  </a>
                )}
              </TableCell>
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
                    Acceso suspendido
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {p.isPaid && COMMISSION_STATUSES.includes(p.status) && (
                    <>
                      {p.commissionStatus !==
                        ProductionCommissionStatus.paid && (
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          isDisabled={busyId === p._id}
                          onPress={() =>
                            handleCommission(p, ProductionCommissionStatus.paid)
                          }
                        >
                          {isAccessSuspended(p)
                            ? "Comisión cobrada: restablecer acceso"
                            : "Comisión cobrada"}
                        </Button>
                      )}
                      {p.commissionStatus !==
                        ProductionCommissionStatus.unpaid && (
                        <Button
                          size="sm"
                          color="warning"
                          variant="flat"
                          isDisabled={busyId === p._id}
                          onPress={() =>
                            handleCommission(
                              p,
                              ProductionCommissionStatus.unpaid
                            )
                          }
                        >
                          Comisión impaga: suspender acceso
                        </Button>
                      )}
                    </>
                  )}
                  {p.isPaid &&
                    p.commissionStatus === ProductionCommissionStatus.paid && (
                      <Button
                        size="sm"
                        variant="flat"
                        isDisabled={busyId === p._id}
                        onPress={() => {
                          setSelected(p);
                          setFacturaFile(null);
                          facturaModal.onOpen();
                        }}
                      >
                        {p.facturaUrl
                          ? "Reemplazar factura"
                          : "Factura de la comisión"}
                      </Button>
                    )}
                  {p.status === ProductionTicketPurchaseStatus.pending && (
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
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={facturaModal.isOpen}
        onOpenChange={facturaModal.onOpenChange}
        isDismissable={!isUploadingFactura}
        hideCloseButton={isUploadingFactura}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Factura de la comisión (para el comprador)</ModalHeader>
              <ModalBody>
                <label
                  htmlFor="production-ticket-factura-file"
                  className="flex items-center gap-2 cursor-pointer text-sm border border-dashed rounded-lg p-3 hover:bg-default-100"
                >
                  {facturaFile
                    ? "Cambiar archivo"
                    : "Seleccionar archivo (PDF o imagen)"}
                </label>
                <input
                  id="production-ticket-factura-file"
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) =>
                    handleFacturaFileChange(e.target.files?.[0] ?? null)
                  }
                  disabled={isUploadingFactura}
                />
                {facturaFile && (
                  <p className="text-sm text-default-600">{facturaFile.name}</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={isUploadingFactura}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={submitFactura}
                  isDisabled={!facturaFile}
                  isLoading={isUploadingFactura}
                >
                  Guardar
                </Button>
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
