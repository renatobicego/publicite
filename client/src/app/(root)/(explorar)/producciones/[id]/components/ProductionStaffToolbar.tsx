"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { FaFolderPlus, FaUpload, FaFileMedical } from "react-icons/fa";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { createFolder } from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { PRODUCTIONS } from "@/utils/data/urls";
import { PRODUCTION_FILE_ACCEPT } from "../../productionFiles";
import { ProductionUploadProgress } from "./useProductionUpload";

interface Props {
  productionId: string;
  parentId?: string;
  /** Se llama tras crear cualquier ítem para refrescar la grilla. */
  onCreated: () => void;
  /** Subida compartida con el arrastre de archivos (`useProductionUpload`). */
  uploadFiles: (files: File[], parentId?: string) => Promise<number>;
  uploadProgress: ProductionUploadProgress | null;
}

const ProductionStaffToolbar = ({
  productionId,
  parentId,
  onCreated,
  uploadFiles,
  uploadProgress,
}: Props) => {
  const router = useRouter();
  const folderModal = useDisclosure();
  const [folderName, setFolderName] = useState("");
  const [busy, setBusy] = useState(false);
  const uploading = uploadProgress !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goToCreateArticle = () => {
    const query = parentId ? `?parentId=${parentId}` : "";
    router.push(`${PRODUCTIONS}/${productionId}/crear-articulo${query}`);
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toastifyError("El nombre de la carpeta es obligatorio");
      return;
    }
    setBusy(true);
    try {
      const res = await createFolder({
        productionId,
        parentId,
        name: folderName.trim(),
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Carpeta creada");
      setFolderName("");
      folderModal.onClose();
      onCreated();
    } finally {
      setBusy(false);
    }
  };

  const handleFilesPicked = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    // Permitir volver a elegir los mismos archivos.
    event.target.value = "";
    if ((await uploadFiles(files, parentId)) > 0) onCreated();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          startContent={<FaFolderPlus />}
          variant="flat"
          onPress={folderModal.onOpen}
          isDisabled={busy}
        >
          Nueva carpeta
        </Button>
        <Button
          startContent={uploading ? undefined : <FaUpload />}
          variant="flat"
          onPress={() => fileInputRef.current?.click()}
          isDisabled={busy || uploading}
          isLoading={uploading}
        >
          {!uploadProgress
            ? "Subir archivos"
            : uploadProgress.total > 1
              ? `Subiendo ${uploadProgress.current} de ${uploadProgress.total} (${uploadProgress.percent}%)`
              : `Subiendo… ${uploadProgress.percent}%`}
        </Button>
        <Button
          startContent={<FaFileMedical />}
          variant="flat"
          onPress={goToCreateArticle}
          isDisabled={busy}
        >
          Nuevo artículo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={PRODUCTION_FILE_ACCEPT}
          className="hidden"
          onChange={handleFilesPicked}
        />
      </div>

      {/* Modal crear carpeta */}
      <Modal isOpen={folderModal.isOpen} onOpenChange={folderModal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Nueva carpeta</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Nombre"
                  value={folderName}
                  onValueChange={setFolderName}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} isDisabled={busy}>
                  Cancelar
                </Button>
                <PrimaryButton onClick={handleCreateFolder} disabled={busy}>
                  {busy ? "Creando…" : "Crear"}
                </PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductionStaffToolbar;
