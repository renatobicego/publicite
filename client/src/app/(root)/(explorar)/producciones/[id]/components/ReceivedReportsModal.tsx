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
} from "@nextui-org/react";
import { FaUserShield } from "react-icons/fa";
import { getProductionReceivedReports } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionItemKind,
  ProductionReceivedReport,
  ProductionReportStatus,
} from "@/types/productionTypes";
import { reportReasonLabel } from "./ReportModal";

interface Props {
  productionId: string;
  productionTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusChip: Record<
  ProductionReportStatus,
  { label: string; color: "warning" | "danger" | "success" }
> = {
  [ProductionReportStatus.pending]: { label: "En revisión", color: "warning" },
  [ProductionReportStatus.upheld]: {
    label: "Confirmada: contenido bloqueado",
    color: "danger",
  },
  [ProductionReportStatus.dismissed]: { label: "Desestimada", color: "success" },
};

const kindLabel: Record<ProductionItemKind, string> = {
  [ProductionItemKind.folder]: "Carpeta",
  [ProductionItemKind.file]: "Archivo",
  [ProductionItemKind.article]: "Artículo",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/**
 * Denuncias que recibió el blog, para su staff: qué fue denunciado, por qué y
 * cómo se resolvió. Nunca quién denunció (el server no lo envía).
 */
const ReceivedReportsModal = ({
  productionId,
  productionTitle,
  isOpen,
  onOpenChange,
}: Props) => {
  const [reports, setReports] = useState<ProductionReceivedReport[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setReports(null);
    setError(null);
    getProductionReceivedReports(productionId).then((res) => {
      if (cancelled) return;
      if (isProductionActionError(res)) setError(res.error);
      else setReports(res);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, productionId]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Denuncias recibidas</ModalHeader>
            <ModalBody className="gap-3">
              <p className="flex items-start gap-2 rounded-xl bg-default-100 px-3 py-2 text-xs text-default-600">
                <FaUserShield className="mt-0.5 shrink-0" />
                Acá ves qué contenido fue denunciado y el motivo. La identidad
                de quien denuncia es reservada. Soonpublicité revisa cada
                denuncia y decide si el contenido se bloquea o se restaura.
              </p>

              {error ? (
                <p className="py-6 text-center text-sm text-danger">{error}</p>
              ) : !reports ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : reports.length === 0 ? (
                <p className="py-8 text-center text-sm text-default-500">
                  Tu blog no recibió denuncias. 🎉
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {reports.map((report) => {
                    const chip = statusChip[report.status];
                    return (
                      <li
                        key={report._id}
                        className="flex flex-col gap-1.5 rounded-xl border border-default-200 px-3 py-2.5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-default-500">
                              {report.item
                                ? report.itemKind
                                  ? kindLabel[report.itemKind]
                                  : "Contenido"
                                : "Blog completo"}
                            </p>
                            <p className="break-words text-sm font-medium">
                              {report.item
                                ? (report.itemName ?? "Contenido eliminado")
                                : productionTitle}
                            </p>
                          </div>
                          <Chip size="sm" variant="flat" color={chip.color}>
                            {chip.label}
                          </Chip>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">Motivo:</span>{" "}
                          {reportReasonLabel[report.reason] ?? report.reason}
                        </p>
                        {report.details && (
                          <p className="whitespace-pre-line text-sm text-default-600">
                            “{report.details}”
                          </p>
                        )}
                        {report.reviewNote && (
                          <p className="text-xs text-default-600">
                            <span className="font-medium">
                              Nota de Soonpublicité:
                            </span>{" "}
                            {report.reviewNote}
                          </p>
                        )}
                        <p className="text-xs text-default-400">
                          Denunciado el {formatDate(report.createdAt)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
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

export default ReceivedReportsModal;
