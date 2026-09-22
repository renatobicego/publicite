"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@nextui-org/react";
import { FaEllipsisV, FaPen, FaTrash } from "react-icons/fa";
import {
  ProductionItemKind,
  ProductionItemResponse,
} from "@/types/productionTypes";
import {
  updateFolder,
  updateFile,
  deleteFolder,
  deleteFile,
  deleteArticle,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { PRODUCTIONS } from "@/utils/data/urls";
import { cleanupItemFiles } from "../../productionMediaCleanup";

interface Props {
  item: ProductionItemResponse;
  /** Recargar el nivel actual del árbol luego de un cambio. */
  onChanged: () => void;
}

/**
 * Acciones de staff sobre un ítem del árbol: renombrar (carpeta/archivo),
 * editar artículo y borrar (carpeta/archivo/artículo). Sólo se monta cuando
 * el viewer tiene `canEdit`. El borrado es en cascada (hard delete).
 */
const ProductionItemActions = ({ item, onChanged }: Props) => {
  const router = useRouter();
  const renameModal = useDisclosure();
  const [name, setName] = useState(item.name);
  const [busy, setBusy] = useState(false);

  const isFolder = item.kind === ProductionItemKind.folder;
  const isArticle = item.kind === ProductionItemKind.article;
  const isFile = item.kind === ProductionItemKind.file;

  const kindLabel = isFolder
    ? "la carpeta"
    : isArticle
      ? "el artículo"
      : "el archivo";

  const handleEdit = () => {
    if (isArticle) {
      router.push(`${PRODUCTIONS}/${item.production}/editar-articulo/${item._id}`);
      return;
    }
    // Carpeta / archivo: renombrar en un modal.
    setName(item.name);
    renameModal.onOpen();
  };

  const handleRename = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toastifyError("El nombre es obligatorio");
      return;
    }
    setBusy(true);
    try {
      const res = isFolder
        ? await updateFolder(item._id, { name: trimmed })
        : await updateFile(item._id, { name: trimmed });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Nombre actualizado");
      renameModal.onClose();
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        isFolder
          ? "¿Borrar la carpeta y todo su contenido? No se puede deshacer."
          : `¿Borrar ${kindLabel}? No se puede deshacer.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = isFolder
        ? await deleteFolder(item._id)
        : isArticle
          ? await deleteArticle(item._id)
          : await deleteFile(item._id);
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      // Limpieza de archivos en UploadThing (archivo/artículo). Las carpetas
      // se limpian en el backend por el borrado en cascada.
      if (!isFolder) {
        await cleanupItemFiles(item);
      }
      toastifySuccess("Eliminado");
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button
            size="sm"
            variant="flat"
            isIconOnly
            aria-label="Acciones del ítem"
            isDisabled={busy}
          >
            <FaEllipsisV />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Acciones del ítem">
          <DropdownItem
            key="edit"
            startContent={<FaPen />}
            onPress={handleEdit}
          >
            {isArticle ? "Editar artículo" : "Renombrar"}
          </DropdownItem>
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            startContent={<FaTrash />}
            onPress={handleDelete}
          >
            Borrar
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Modal de renombrar (carpeta / archivo) */}
      <Modal isOpen={renameModal.isOpen} onOpenChange={renameModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                Renombrar {isFolder ? "carpeta" : "archivo"}
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Nombre"
                  value={name}
                  onValueChange={setName}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} isDisabled={busy}>
                  Cancelar
                </Button>
                <PrimaryButton onClick={handleRename} disabled={busy}>
                  {busy ? "Guardando…" : "Guardar"}
                </PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductionItemActions;
