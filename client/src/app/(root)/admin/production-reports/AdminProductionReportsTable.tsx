"use client";
import { useCallback, useEffect, useState } from "react";
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
  useDisclosure,
} from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  getProductionReportTargetsAdmin,
  getProductionTargetReportsAdmin,
  moderateProductionContent,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionModerationAction,
  ProductionReportDetail,
  ProductionReportStatus,
  ProductionReportTarget,
} from "@/types/productionTypes";

const reasonLabel: Record<string, string> = {
  inappropriate: "Inapropiado",
  violence: "Violencia",
  sexual: "Sexual",
  spam: "Spam",
  copyright: "Copyright",
  other: "Otro",
};

/** Panel admin de revisión de denuncias (DEN-03). */
const AdminProductionReportsTable = () => {
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState<ProductionReportTarget[]>([]);
  const [status, setStatus] = useState<ProductionReportStatus>(
    ProductionReportStatus.pending
  );
  const [busy, setBusy] = useState(false);

  const detailModal = useDisclosure();
  const [selected, setSelected] = useState<ProductionReportTarget | null>(null);
  const [details, setDetails] = useState<ProductionReportDetail[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getProductionReportTargetsAdmin(status, 1, 50);
    if (!isProductionActionError(res)) {
      setTargets(res.targets);
    } else {
      toastifyError(res.error);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (target: ProductionReportTarget) => {
    setSelected(target);
    detailModal.onOpen();
    const res = await getProductionTargetReportsAdmin(
      target.production,
      target.item ?? undefined
    );
    if (!isProductionActionError(res)) {
      setDetails(res);
    }
  };

  const moderate = async (action: ProductionModerationAction) => {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await moderateProductionContent({
        productionId: selected.production,
        itemId: selected.item ?? undefined,
        action,
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(
        action === ProductionModerationAction.block
          ? "Contenido bloqueado"
          : "Contenido restaurado"
      );
      detailModal.onClose();
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 mb-4">
        {Object.values(ProductionReportStatus).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "solid" : "flat"}
            color={status === s ? "secondary" : "default"}
            onPress={() => setStatus(s)}
          >
            {s === "pending"
              ? "Pendientes"
              : s === "upheld"
              ? "Bloqueadas"
              : "Descartadas"}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <Table aria-label="Contenidos denunciados">
          <TableHeader>
            <TableColumn>BLOG</TableColumn>
            <TableColumn>CONTENIDO</TableColumn>
            <TableColumn>DENUNCIAS</TableColumn>
            <TableColumn>MOTIVOS</TableColumn>
            <TableColumn>ESTADO MOD.</TableColumn>
            <TableColumn>ACCIÓN</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Sin contenidos denunciados.">
            {targets.map((t) => (
              <TableRow key={`${t.production}-${t.item ?? "blog"}`}>
                <TableCell>{t.productionTitle || t.production.slice(-6)}</TableCell>
                <TableCell>{t.itemName || "Todo el blog"}</TableCell>
                <TableCell>{t.reports}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {t.reasons.map((r) => (
                      <Chip key={r} size="sm" variant="flat">
                        {reasonLabel[r] ?? r}
                      </Chip>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{t.moderationStatus ?? "-"}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => openDetail(t)}
                  >
                    Revisar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={detailModal.isOpen}
        onOpenChange={detailModal.onOpenChange}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {selected?.productionTitle} ·{" "}
                {selected?.itemName || "Todo el blog"}
              </ModalHeader>
              <ModalBody className="gap-2">
                {details.length === 0 ? (
                  <Spinner />
                ) : (
                  details.map((d) => (
                    <div key={d._id} className="rounded-lg border p-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {reasonLabel[d.reason] ?? d.reason}
                        </span>
                        <span className="text-default-400">
                          {d.reporterInfo?.username ||
                            d.reporterInfo?.email ||
                            d.reporter.slice(-6)}
                        </span>
                      </div>
                      {d.details && (
                        <p className="text-default-600">{d.details}</p>
                      )}
                    </div>
                  ))
                )}
              </ModalBody>
              <ModalFooter className="justify-between">
                <Button
                  variant="flat"
                  isDisabled={busy}
                  onPress={() => moderate(ProductionModerationAction.restore)}
                >
                  Restaurar
                </Button>
                <PrimaryButton
                  onClick={() => moderate(ProductionModerationAction.block)}
                  disabled={busy}
                >
                  Bloquear contenido
                </PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AdminProductionReportsTable;
