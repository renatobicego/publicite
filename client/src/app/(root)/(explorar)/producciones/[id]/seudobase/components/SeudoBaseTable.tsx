"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Selection,
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
  getProductionSeudoBase,
  bulkUpdateProductionPrices,
  bulkUpdateProductionVisibility,
  bulkDeleteProductionItems,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionBulkResult,
  ProductionPriceChangeMode,
  ProductionSeudoBaseRow,
  ProductionVisibility,
} from "@/types/productionTypes";
import {
  visibilityLabel,
  visibilityOptions,
} from "../../../productionVisibility";

type BulkKind = "price" | "visibility" | "delete";

const SeudoBaseTable = ({ productionId }: { productionId: string }) => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProductionSeudoBaseRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  // Estado de la operación masiva en preparación.
  const confirmModal = useDisclosure();
  const [bulkKind, setBulkKind] = useState<BulkKind>("price");
  const [priceMode, setPriceMode] = useState<ProductionPriceChangeMode>(
    ProductionPriceChangeMode.percentage
  );
  const [priceValue, setPriceValue] = useState("5");
  const [bulkVisibility, setBulkVisibility] = useState<
    ProductionVisibility | "__inherit__"
  >(ProductionVisibility.public);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getProductionSeudoBase(
      productionId,
      searchTerm ? { searchTerm } : undefined,
      1,
      100
    );
    if (isProductionActionError(res)) {
      toastifyError(res.error);
    } else {
      setRows(res.rows);
    }
    setLoading(false);
  }, [productionId, searchTerm]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  const openBulk = (kind: BulkKind) => {
    if (selectedIds.length === 0) {
      toastifyError("Seleccioná al menos un ítem");
      return;
    }
    setBulkKind(kind);
    confirmModal.onOpen();
  };

  const runBulk = async () => {
    setBusy(true);
    try {
      let res: ProductionBulkResult | { error: string };
      if (bulkKind === "price") {
        res = await bulkUpdateProductionPrices({
          productionId,
          itemIds: selectedIds,
          confirm: true,
          mode: priceMode,
          value: Number(priceValue),
        });
      } else if (bulkKind === "visibility") {
        res = await bulkUpdateProductionVisibility({
          productionId,
          itemIds: selectedIds,
          confirm: true,
          visibility:
            bulkVisibility === "__inherit__" ? null : bulkVisibility,
        });
      } else {
        res = await bulkDeleteProductionItems({
          productionId,
          itemIds: selectedIds,
          confirm: true,
        });
      }
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(
        `Operación aplicada: ${res.affected} afectados, ${res.skipped.length} omitidos.`
      );
      setSelected(new Set());
      confirmModal.onClose();
      await load();
    } finally {
      setBusy(false);
    }
  };

  const confirmMessage = () => {
    const n = selectedIds.length;
    if (bulkKind === "price") {
      return `Vas a cambiar el precio de ${n} ítem(s). Sólo se aplica a los que tienen ticket pago propio.`;
    }
    if (bulkKind === "visibility") {
      return `Vas a cambiar el alcance de ${n} ítem(s).`;
    }
    return `Vas a BORRAR ${n} ítem(s) de forma permanente. Esta acción no se puede deshacer.`;
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          className="max-w-xs"
          placeholder="Buscar por título o Nº"
          value={searchTerm}
          onValueChange={setSearchTerm}
          onKeyDown={(e) => {
            if (e.key === "Enter") load();
          }}
        />
        <Button variant="flat" onPress={load} isDisabled={loading}>
          Buscar
        </Button>
      </div>

      {/* Barra de operaciones masivas */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-default-500">
          {selectedIds.length} seleccionado(s)
        </span>
        <Button
          size="sm"
          variant="flat"
          isDisabled={selectedIds.length === 0}
          onPress={() => openBulk("price")}
        >
          Cambiar precio
        </Button>
        <Button
          size="sm"
          variant="flat"
          isDisabled={selectedIds.length === 0}
          onPress={() => openBulk("visibility")}
        >
          Cambiar alcance
        </Button>
        <Button
          size="sm"
          color="danger"
          variant="flat"
          isDisabled={selectedIds.length === 0}
          onPress={() => openBulk("delete")}
        >
          Borrar
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <Table
          aria-label="SeudoBase"
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={(keys: Selection) =>
            setSelected(
              keys === "all"
                ? new Set(rows.map((r) => r._id))
                : new Set(Array.from(keys as Set<string>))
            )
          }
        >
          <TableHeader>
            <TableColumn>Nº</TableColumn>
            <TableColumn>TÍTULO</TableColumn>
            <TableColumn>TIPO</TableColumn>
            <TableColumn>PRECIO</TableColumn>
            <TableColumn>ALCANCE</TableColumn>
            <TableColumn>RUTA</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Sin ítems.">
            {rows.map((row) => (
              <TableRow key={row._id}>
                <TableCell>{row.fileName || "-"}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.fileType || row.kind}</TableCell>
                <TableCell>
                  {row.price != null ? row.price : "-"}
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat">
                    {visibilityLabel[row.effectiveVisibility]}
                  </Chip>
                </TableCell>
                <TableCell>{row.path || "/"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal de confirmación obligatoria (SB-02/03) */}
      <Modal isOpen={confirmModal.isOpen} onOpenChange={confirmModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirmar operación masiva</ModalHeader>
              <ModalBody className="gap-3">
                <p className="text-sm">{confirmMessage()}</p>

                {bulkKind === "price" && (
                  <div className="flex gap-2 items-end">
                    <Select
                      className="max-w-[10rem]"
                      label="Modo"
                      selectedKeys={[priceMode]}
                      onChange={(e) =>
                        setPriceMode(
                          e.target.value as ProductionPriceChangeMode
                        )
                      }
                    >
                      <SelectItem key={ProductionPriceChangeMode.percentage}>
                        Porcentaje
                      </SelectItem>
                      <SelectItem key={ProductionPriceChangeMode.fixed}>
                        Precio fijo
                      </SelectItem>
                    </Select>
                    <Input
                      type="number"
                      label={
                        priceMode === ProductionPriceChangeMode.percentage
                          ? "% (ej. 5 = +5%)"
                          : "Nuevo precio"
                      }
                      value={priceValue}
                      onValueChange={setPriceValue}
                    />
                  </div>
                )}

                {bulkKind === "visibility" && (
                  <Select
                    label="Nuevo alcance"
                    selectedKeys={[bulkVisibility]}
                    onChange={(e) =>
                      setBulkVisibility(
                        e.target.value as ProductionVisibility | "__inherit__"
                      )
                    }
                    items={[
                      { key: "__inherit__", label: "Heredar del padre" },
                      ...visibilityOptions.map((o) => ({
                        key: o,
                        label: visibilityLabel[o],
                      })),
                    ]}
                  >
                    {(entry: { key: string; label: string }) => (
                      <SelectItem key={entry.key}>{entry.label}</SelectItem>
                    )}
                  </Select>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} isDisabled={busy}>
                  Cancelar
                </Button>
                <PrimaryButton onClick={runBulk} disabled={busy}>
                  {busy ? "Aplicando…" : "Confirmar"}
                </PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SeudoBaseTable;
