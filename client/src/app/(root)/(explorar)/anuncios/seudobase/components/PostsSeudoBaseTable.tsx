"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  Image,
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
  Switch,
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
import { FILE_URL } from "@/utils/data/urls";
import {
  bulkDeletePosts,
  bulkUpdatePostFrequency,
  bulkUpdatePostPrices,
  bulkUpdatePostVisibility,
  getPostSeudoBase,
} from "@/app/server/postSeudoBaseActions";
import { updatePostActiveStatus } from "@/app/server/postActions";
import {
  isPostSeudoBaseActionError,
  PostBulkResult,
  PostPriceChangeMode,
  PostSeudoBaseFrequency,
  PostSeudoBaseRow,
  PostSeudoBaseType,
  PostVisibility,
} from "@/types/postSeudoBaseTypes";
import { frequencyPriceItems } from "@/utils/data/selectData";

type BulkKind = "price" | "frequency" | "visibility" | "delete";

const NEGOTIABLE_PRICE = 8613.1;

const visibilityLabel: Record<PostVisibility, string> = {
  [PostVisibility.public]: "Público",
  [PostVisibility.registered]: "Registrados",
  [PostVisibility.contacts]: "Contactos",
  [PostVisibility.friends]: "Amigos",
  [PostVisibility.topfriends]: "Mejores amigos",
};

const visibilityOptions = Object.values(PostVisibility);

const postTypeLabel: Record<PostSeudoBaseType, string> = {
  [PostSeudoBaseType.good]: "Bien",
  [PostSeudoBaseType.service]: "Servicio",
  [PostSeudoBaseType.petition]: "Necesidad",
};

/** Texto en español de la frecuencia (reusa el catálogo de los formularios). */
const frequencyText = (
  frequency?: PostSeudoBaseFrequency | "undefined" | null
) => {
  if (!frequency || frequency === "undefined") return null;
  return frequencyPriceItems.find((item) => item.value === frequency)?.text ?? null;
};

/**
 * Arma el precio a mostrar según el tipo:
 *  - Bien: `$X` (o "Negociable").
 *  - Servicio: `$X por {frecuencia}`.
 *  - Necesidad: `De $X a $Y por {frecuencia}` cuando hay rango.
 */
const formatRowPrice = (row: PostSeudoBaseRow) => {
  if (row.price === NEGOTIABLE_PRICE) return "Negociable";

  const base =
    typeof row.toPrice === "number"
      ? `De $${row.price} a $${row.toPrice}`
      : `$${row.price}`;

  const freq = frequencyText(row.frequencyPrice);
  return freq ? `${base} por ${freq}` : base;
};

/**
 * SeudoBase de Anuncios: tabla tipo Excel de los anuncios del usuario, con
 * selección múltiple y las 3 operaciones masivas (precio, visibilidad,
 * borrado) con confirmación obligatoria (SB-01/02/03).
 */
const PostsSeudoBaseTable = ({ authorId }: { authorId: string }) => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PostSeudoBaseRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  // Id del anuncio cuyo toggle de "Activo" está en curso (loading por fila).
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const confirmModal = useDisclosure();
  const [bulkKind, setBulkKind] = useState<BulkKind>("price");
  const [priceMode, setPriceMode] = useState<PostPriceChangeMode>(
    PostPriceChangeMode.percentage
  );
  const [priceValue, setPriceValue] = useState("5");
  const [bulkFrequency, setBulkFrequency] =
    useState<PostSeudoBaseFrequency>("month");
  const [bulkVisibility, setBulkVisibility] = useState<PostVisibility>(
    PostVisibility.public
  );

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getPostSeudoBase(
      searchTerm ? { searchTerm } : undefined,
      1,
      100
    );
    if (isPostSeudoBaseActionError(res)) {
      toastifyError(res.error);
    } else {
      setRows(res.rows);
    }
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  // Cuántos de los seleccionados son Bienes (se omiten en el cambio de frecuencia).
  const selectedGoodsCount = useMemo(
    () =>
      rows.filter(
        (r) => selected.has(r._id) && r.postType === PostSeudoBaseType.good
      ).length,
    [rows, selected]
  );

  const openBulk = (kind: BulkKind) => {
    if (selectedIds.length === 0) {
      toastifyError("Seleccioná al menos un anuncio");
      return;
    }
    setBulkKind(kind);
    confirmModal.onOpen();
  };

  const runBulk = async () => {
    setBusy(true);
    try {
      let res: PostBulkResult | { error: string };
      if (bulkKind === "price") {
        res = await bulkUpdatePostPrices({
          postIds: selectedIds,
          confirm: true,
          mode: priceMode,
          value: Number(priceValue),
        });
      } else if (bulkKind === "frequency") {
        res = await bulkUpdatePostFrequency({
          postIds: selectedIds,
          confirm: true,
          frequencyPrice: bulkFrequency,
        });
      } else if (bulkKind === "visibility") {
        res = await bulkUpdatePostVisibility({
          postIds: selectedIds,
          confirm: true,
          visibility: bulkVisibility,
        });
      } else {
        res = await bulkDeletePosts({
          postIds: selectedIds,
          confirm: true,
        });
      }
      if (isPostSeudoBaseActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(
        `Operación aplicada: ${res.affected} afectado(s), ${res.skipped.length} omitido(s).`
      );
      setSelected(new Set());
      confirmModal.onClose();
      await load();
    } finally {
      setBusy(false);
    }
  };

  // Activa/desactiva un anuncio desde el toggle de la fila (no es masivo).
  const handleToggleActive = async (row: PostSeudoBaseRow) => {
    const next = !row.isActive;
    setTogglingId(row._id);
    // Optimista: reflejamos el cambio ya mismo y revertimos si falla.
    setRows((prev) =>
      prev.map((r) => (r._id === row._id ? { ...r, isActive: next } : r))
    );
    try {
      const res = await updatePostActiveStatus(
        row._id,
        authorId,
        row.postBehaviourType,
        next
      );
      if ("error" in res) {
        setRows((prev) =>
          prev.map((r) =>
            r._id === row._id ? { ...r, isActive: row.isActive } : r
          )
        );
        toastifyError(res.error);
        return;
      }
      toastifySuccess(
        next ? "Anuncio activado" : "Anuncio desactivado"
      );
    } catch {
      setRows((prev) =>
        prev.map((r) =>
          r._id === row._id ? { ...r, isActive: row.isActive } : r
        )
      );
      toastifyError("No se pudo cambiar el estado del anuncio");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmMessage = () => {
    const n = selectedIds.length;
    if (bulkKind === "price") {
      return `Vas a cambiar el precio de ${n} anuncio(s). Los anuncios "Negociable" se omiten en cambios porcentuales. En cambios a precio fijo se descarta el rango de las Necesidades.`;
    }
    if (bulkKind === "frequency") {
      return `Vas a cambiar la frecuencia del precio de ${n} anuncio(s). Sólo aplica a Servicios y Necesidades; los Bienes se omiten (no tienen frecuencia).`;
    }
    if (bulkKind === "visibility") {
      return `Vas a cambiar la visibilidad de ${n} anuncio(s).`;
    }
    return `Vas a BORRAR ${n} anuncio(s) de forma permanente. Esta acción no se puede deshacer.`;
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          className="max-w-xs"
          placeholder="Buscar por título"
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
          onPress={() => openBulk("frequency")}
        >
          Cambiar frecuencia
        </Button>
        <Button
          size="sm"
          variant="flat"
          isDisabled={selectedIds.length === 0}
          onPress={() => openBulk("visibility")}
        >
          Cambiar visibilidad
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
          aria-label="SeudoBase de Anuncios"
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
            <TableColumn>FOTO</TableColumn>
            <TableColumn>TÍTULO</TableColumn>
            <TableColumn>TIPO</TableColumn>
            <TableColumn>PRECIO</TableColumn>
            <TableColumn>VISIBILIDAD</TableColumn>
            <TableColumn>ACTIVO</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No tenés anuncios.">
            {rows.map((row) => (
              <TableRow key={row._id}>
                <TableCell>
                  {row.imageUrl ? (
                    <Image
                      removeWrapper
                      alt={row.title}
                      src={`${FILE_URL}${row.imageUrl}`}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <span className="text-default-400 text-xs">—</span>
                  )}
                </TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>
                  {postTypeLabel[row.postType] ?? row.postType}
                </TableCell>
                <TableCell>{formatRowPrice(row)}</TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat">
                    {visibilityLabel[row.visibility]}
                  </Chip>
                </TableCell>
                <TableCell>
                  {/* El wrapper frena la propagación para que tocar el toggle
                      no dispare la selección de la fila (selectionMode). */}
                  <div
                    className="inline-flex"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Switch
                      size="sm"
                      isSelected={row.isActive}
                      isDisabled={togglingId === row._id}
                      onValueChange={() => handleToggleActive(row)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal de confirmación obligatoria (SB-02/03) */}
      <Modal
        isOpen={confirmModal.isOpen}
        onOpenChange={confirmModal.onOpenChange}
      >
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
                        setPriceMode(e.target.value as PostPriceChangeMode)
                      }
                    >
                      <SelectItem key={PostPriceChangeMode.percentage}>
                        Porcentaje
                      </SelectItem>
                      <SelectItem key={PostPriceChangeMode.fixed}>
                        Precio fijo
                      </SelectItem>
                    </Select>
                    <Input
                      type="number"
                      label={
                        priceMode === PostPriceChangeMode.percentage
                          ? "% (ej. 5 = +5%)"
                          : "Nuevo precio"
                      }
                      value={priceValue}
                      onValueChange={setPriceValue}
                    />
                  </div>
                )}

                {bulkKind === "frequency" && (
                  <Select
                    label="Nueva frecuencia"
                    selectedKeys={[bulkFrequency]}
                    onChange={(e) =>
                      setBulkFrequency(
                        e.target.value as PostSeudoBaseFrequency
                      )
                    }
                  >
                    {frequencyPriceItems.map((item) => (
                      <SelectItem key={item.value}>{item.label}</SelectItem>
                    ))}
                  </Select>
                )}

                {bulkKind === "frequency" && selectedGoodsCount > 0 && (
                  <p className="text-xs text-warning">
                    {selectedGoodsCount} Bien(es) de la selección se omitirán
                    porque no tienen frecuencia.
                  </p>
                )}

                {bulkKind === "visibility" && (
                  <Select
                    label="Nueva visibilidad"
                    selectedKeys={[bulkVisibility]}
                    onChange={(e) =>
                      setBulkVisibility(e.target.value as PostVisibility)
                    }
                  >
                    {visibilityOptions.map((option) => (
                      <SelectItem key={option}>
                        {visibilityLabel[option]}
                      </SelectItem>
                    ))}
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

export default PostsSeudoBaseTable;
