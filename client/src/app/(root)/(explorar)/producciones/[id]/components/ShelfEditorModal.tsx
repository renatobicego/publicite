"use client";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import {
  FaArrowDown,
  FaArrowUp,
  FaImage,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import imageCompression from "browser-image-compression";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useUploadThing } from "@/utils/uploadThing";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { updateProduction } from "@/app/server/productionActions";
import { deleteFilesService } from "@/app/server/uploadThing";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionShelfCategory,
  ProductionShelfLink,
  ProductionShelfLinkInput,
} from "@/types/productionTypes";
import { resolveProductionFileUrl } from "../../productionMedia";
import {
  SHELF_CATEGORIES,
  SHELF_MAX_ITEMS,
  SHELF_SUBTITLE_MAX,
  SHELF_TITLE_MAX,
} from "../../productionShelf";

interface Draft {
  id: number;
  category: ProductionShelfCategory;
  title: string;
  subtitle: string;
  link: string;
  imageKey?: string;
}

let nextDraftId = 1;
const toDraft = (entry: ProductionShelfLink): Draft => ({
  id: nextDraftId++,
  category: entry.category,
  title: entry.title,
  subtitle: entry.subtitle ?? "",
  link: entry.link ?? "",
  imageKey: entry.imageKey ?? undefined,
});

const emptyDraft = (): Draft => ({
  id: nextDraftId++,
  category: ProductionShelfCategory.books,
  title: "",
  subtitle: "",
  link: "",
});

const isValidLink = (link: string) =>
  !link.trim() || /^https?:\/\/\S+\.\S+/i.test(link.trim());

interface Props {
  productionId: string;
  shelf: ProductionShelfLink[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

/** Edición de la estantería: agregar, ordenar, cambiar y quitar objetos. */
const ShelfEditorModal = ({
  productionId,
  shelf,
  isOpen,
  onOpenChange,
  onSaved,
}: Props) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  // Imágenes subidas en esta edición: si se cancela, se borran de UploadThing.
  const uploadedKeys = useRef<Set<string>>(new Set());
  const pickingFor = useRef<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("fileUploader", {
    onUploadError: (e) => toastifyError(`Error al subir la imagen: ${e.name}`),
  });

  useEffect(() => {
    if (!isOpen) return;
    setDrafts(shelf.length > 0 ? shelf.map(toDraft) : [emptyDraft()]);
    setShowErrors(false);
    uploadedKeys.current = new Set();
  }, [isOpen, shelf]);

  const update = (id: number, patch: Partial<Draft>) =>
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft))
    );

  const move = (index: number, step: -1 | 1) =>
    setDrafts((current) => {
      const target = index + step;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const discardUploaded = (key?: string) => {
    if (key && uploadedKeys.current.has(key)) {
      uploadedKeys.current.delete(key);
      deleteFilesService([key]);
    }
  };

  const remove = (draft: Draft) => {
    discardUploaded(draft.imageKey);
    setDrafts((current) => current.filter((entry) => entry.id !== draft.id));
  };

  const pickImage = (id: number) => {
    pickingFor.current = id;
    imageInputRef.current?.click();
  };

  const handleImagePicked = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const id = pickingFor.current;
    if (!file || id === null) return;
    if (!file.type.startsWith("image/")) {
      toastifyError("Tiene que ser una imagen");
      return;
    }
    setUploadingId(id);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });
      const res = await startUpload([compressed]);
      const key = res?.[0]?.key;
      if (!key) {
        toastifyError("No se pudo subir la imagen");
        return;
      }
      uploadedKeys.current.add(key);
      const previous = drafts.find((draft) => draft.id === id)?.imageKey;
      discardUploaded(previous);
      update(id, { imageKey: key });
    } finally {
      setUploadingId(null);
    }
  };

  const handleCancel = (onClose: () => void) => {
    uploadedKeys.current.forEach((key) => deleteFilesService([key]));
    uploadedKeys.current = new Set();
    onClose();
  };

  const handleSave = async (onClose: () => void) => {
    // Las filas sin nada escrito se ignoran.
    const filled = drafts.filter(
      (draft) =>
        draft.title.trim() ||
        draft.subtitle.trim() ||
        draft.link.trim() ||
        draft.imageKey
    );
    const invalid = filled.some(
      (draft) => !draft.title.trim() || !isValidLink(draft.link)
    );
    if (invalid) {
      setShowErrors(true);
      toastifyError("Revisá los objetos marcados: falta el título o el link no es válido");
      return;
    }

    const payload: ProductionShelfLinkInput[] = filled.map((draft) => ({
      category: draft.category,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || undefined,
      link: draft.link.trim() || undefined,
      imageKey: draft.imageKey,
    }));

    setSaving(true);
    try {
      const res = await updateProduction(productionId, { shelf: payload });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      // Imágenes que estaban en el estante y ya no: se borran del storage.
      const kept = new Set(payload.map((entry) => entry.imageKey));
      const removed = shelf
        .map((entry) => entry.imageKey)
        .filter((key): key is string => !!key && !kept.has(key));
      if (removed.length > 0) deleteFilesService(removed);
      uploadedKeys.current = new Set();
      toastifySuccess("Estante actualizado");
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      isDismissable={false}
      hideCloseButton
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Estantería
              <span className="text-xs font-normal text-default-500">
                Recomendaciones cortas que se ven debajo del encabezado del
                blog. Con imagen se muestran de frente; sin imagen, como un
                lomo con el título.
              </span>
            </ModalHeader>
            <ModalBody className="gap-3">
              {drafts.map((draft, index) => {
                const category = SHELF_CATEGORIES.find(
                  (option) => option.key === draft.category
                );
                return (
                  <div
                    key={draft.id}
                    className="flex flex-col gap-2 rounded-xl border border-default-200 p-3 sm:flex-row"
                  >
                    {/* Imagen opcional */}
                    <button
                      type="button"
                      onClick={() => pickImage(draft.id)}
                      className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-medium border border-dashed border-default-300 bg-default-50 text-default-400 sm:h-auto sm:w-20"
                      aria-label={draft.imageKey ? "Cambiar imagen" : "Agregar imagen"}
                      title={draft.imageKey ? "Cambiar imagen" : "Agregar imagen (opcional)"}
                    >
                      {uploadingId === draft.id ? (
                        <Spinner size="sm" />
                      ) : draft.imageKey ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveProductionFileUrl(draft.imageKey)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FaImage className="text-xl" />
                      )}
                    </button>

                    <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                      <Select
                        size="sm"
                        label="Tipo"
                        disallowEmptySelection
                        selectedKeys={[draft.category]}
                        onSelectionChange={(keys) =>
                          update(draft.id, {
                            category:
                              (Array.from(keys)[0] as ProductionShelfCategory) ??
                              draft.category,
                          })
                        }
                      >
                        {SHELF_CATEGORIES.map((option) => (
                          <SelectItem key={option.key}>{option.label}</SelectItem>
                        ))}
                      </Select>
                      <Input
                        size="sm"
                        isRequired
                        label="Título"
                        value={draft.title}
                        maxLength={SHELF_TITLE_MAX}
                        onValueChange={(title) => update(draft.id, { title })}
                        isInvalid={showErrors && !draft.title.trim()}
                        errorMessage="Obligatorio"
                      />
                      <Input
                        size="sm"
                        label={`${category?.subtitleHint ?? "Detalle"} (opcional)`}
                        value={draft.subtitle}
                        maxLength={SHELF_SUBTITLE_MAX}
                        onValueChange={(subtitle) =>
                          update(draft.id, { subtitle })
                        }
                      />
                      <Input
                        size="sm"
                        type="url"
                        label="Link (opcional)"
                        placeholder="https://…"
                        value={draft.link}
                        onValueChange={(link) => update(draft.id, { link })}
                        isInvalid={showErrors && !isValidLink(draft.link)}
                        errorMessage="Tiene que empezar con http:// o https://"
                      />
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-1 sm:flex-col sm:justify-start">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        aria-label="Subir"
                        isDisabled={index === 0}
                        onPress={() => move(index, -1)}
                      >
                        <FaArrowUp />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        aria-label="Bajar"
                        isDisabled={index === drafts.length - 1}
                        onPress={() => move(index, 1)}
                      >
                        <FaArrowDown />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        aria-label="Quitar del estante"
                        onPress={() => remove(draft)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                );
              })}

              <Button
                variant="flat"
                startContent={<FaPlus />}
                isDisabled={drafts.length >= SHELF_MAX_ITEMS}
                onPress={() => setDrafts((current) => [...current, emptyDraft()])}
              >
                {drafts.length >= SHELF_MAX_ITEMS
                  ? `Máximo ${SHELF_MAX_ITEMS} objetos`
                  : "Agregar al estante"}
              </Button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImagePicked}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={() => handleCancel(onClose)}
                isDisabled={saving}
              >
                Cancelar
              </Button>
              <PrimaryButton
                onClick={() => handleSave(onClose)}
                disabled={saving || uploadingId !== null}
              >
                {saving ? "Guardando…" : "Guardar estante"}
              </PrimaryButton>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ShelfEditorModal;
