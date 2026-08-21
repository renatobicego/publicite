"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { FaFilePdf, FaPaperclip, FaUpload } from "react-icons/fa6";

import { attachFacturaToInvoice } from "@/services/adminServices";
import { AdminInvoice, PAYMENT_STATUS_LABELS } from "@/types/adminTypes";
import { useUploadThing } from "@/utils/uploadThing";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { formatAdminDate } from "@/utils/functions/adminInvoices";

const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_MB = 8;

interface AttachFacturaModalProps {
  invoice: AdminInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (invoiceId: string, facturaUrl: string, uploadedAt: string) => void;
}

export default function AttachFacturaModal({
  invoice,
  isOpen,
  onClose,
  onSaved,
}: AttachFacturaModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { startUpload } = useUploadThing("uploadSingleFile", {
    onUploadError: (e) => toastifyError(`Error al subir la factura: ${e.message}`),
  });

  // Cada vez que se abre para otro ticket, el archivo elegido antes no aplica.
  useEffect(() => {
    if (isOpen) setFile(null);
  }, [isOpen, invoice?._id]);

  const handleFileChange = (selected: File | null) => {
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toastifyError("La factura tiene que ser un PDF o una imagen");
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      toastifyError(`El archivo no puede superar los ${MAX_SIZE_MB}MB`);
      return;
    }
    setFile(selected);
  };

  const handleSave = async () => {
    if (!invoice || !file) return;
    setIsSaving(true);

    try {
      const uploaded = await startUpload([file]);
      const url = uploaded?.[0]?.ufsUrl ?? uploaded?.[0]?.url;
      if (!url) {
        toastifyError("No se pudo subir la factura. Intentá de nuevo.");
        return;
      }

      const res = await attachFacturaToInvoice(invoice._id, url);
      if ("error" in res) {
        toastifyError(res.error);
        return;
      }

      onSaved(
        invoice._id,
        res.facturaUrl ?? url,
        res.facturaUploadedAt ?? new Date().toISOString()
      );
      toastifySuccess("Factura asociada al ticket");
      onClose();
    } catch {
      toastifyError("Error al guardar la factura. Intentá de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      radius="lg"
      isDismissable={!isSaving}
      hideCloseButton={isSaving}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {invoice?.facturaUrl ? "Reemplazar factura" : "Asociar factura"}
        </ModalHeader>
        <ModalBody>
          {invoice && (
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Ticket:</span> {invoice.invoice_id}
              </p>
              <p>
                <span className="font-medium">Usuario:</span> {invoice.userName}
                {invoice.userEmail ? ` (${invoice.userEmail})` : ""}
              </p>
              <p>
                <span className="font-medium">Monto:</span> $
                {invoice.transactionAmount}
              </p>
              <p>
                <span className="font-medium">Fecha:</span>{" "}
                {formatAdminDate(invoice.timeOfUpdate)}
              </p>
              <p>
                <span className="font-medium">Estado:</span>{" "}
                {PAYMENT_STATUS_LABELS[invoice.paymentStatus] ??
                  invoice.paymentStatus}
              </p>
            </div>
          )}

          {invoice?.facturaUrl && (
            <a
              href={invoice.facturaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-secondary hover:underline"
            >
              <FaFilePdf />
              Ver la factura cargada actualmente
            </a>
          )}

          <div className="mt-2">
            <label
              htmlFor="factura-file"
              className="flex items-center gap-2 cursor-pointer text-sm border border-dashed rounded-lg p-3 hover:bg-default-100"
            >
              <FaUpload />
              {file ? "Cambiar archivo" : "Seleccionar archivo (PDF o imagen)"}
            </label>
            <input
              id="factura-file"
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              disabled={isSaving}
            />
            {file && (
              <p className="flex items-center gap-2 text-sm mt-2 text-default-600">
                <FaPaperclip />
                {file.name}
              </p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            radius="full"
            onPress={onClose}
            isDisabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            color="secondary"
            radius="full"
            onPress={handleSave}
            isDisabled={!file}
            isLoading={isSaving}
          >
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
