"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@nextui-org/react";
import { FaPen, FaTrash } from "react-icons/fa";
import {
  ProductionItemKind,
  ProductionItemResponse,
} from "@/types/productionTypes";
import {
  updateFile,
  deleteFile,
  deleteArticle,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { PRODUCTIONS } from "@/utils/data/urls";
import { cleanupItemFiles } from "../../../../productionMediaCleanup";

/**
 * Controles de staff en el detalle de un ítem (archivo o artículo): editar
 * (artículo → editor; archivo → renombrar) y borrar. Al borrar vuelve al blog.
 */
const ProductionItemDetailActions = ({
  item,
}: {
  item: ProductionItemResponse;
}) => {
  const router = useRouter();
  const renameModal = useDisclosure();
  const [name, setName] = useState(item.name);
  const [busy, setBusy] = useState(false);

  const isArticle = item.kind === ProductionItemKind.article;
  const blogUrl = `${PRODUCTIONS}/${item.production}`;

  const handleEdit = () => {
    if (isArticle) {
      router.push(`${blogUrl}/editar-articulo/${item._id}`);
      return;
    }
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
      const res = await updateFile(item._id, { name: trimmed });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Nombre actualizado");
      renameModal.onClose();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `¿Borrar ${isArticle ? "el artículo" : "el archivo"}? No se puede deshacer.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = isArticle
        ? await deleteArticle(item._id)
        : await deleteFile(item._id);
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      // Limpieza de los archivos del ítem en UploadThing.
      await cleanupItemFiles(item);
      toastifySuccess("Eliminado");
      router.push(blogUrl);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <SecondaryButton
          startContent={<FaPen />}
          onClick={handleEdit}
          disabled={busy}
        >
          {isArticle ? "Editar artículo" : "Renombrar"}
        </SecondaryButton>
        <PrimaryButton
          variant="light"
          startContent={<FaTrash />}
          onClick={handleDelete}
          disabled={busy}
        >
          Borrar
        </PrimaryButton>
      </div>

      {/* Modal de renombrar (archivo) */}
      <Modal isOpen={renameModal.isOpen} onOpenChange={renameModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Renombrar archivo</ModalHeader>
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

export default ProductionItemDetailActions;
