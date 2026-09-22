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
import { useUploadThing } from "@/utils/uploadThing";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  createFolder,
  uploadFile,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { ProductionFileType } from "@/types/productionTypes";
import { PRODUCTIONS } from "@/utils/data/urls";

interface Props {
  productionId: string;
  parentId?: string;
  /** Se llama tras crear cualquier ítem para refrescar la grilla. */
  onCreated: () => void;
}

/** Mapea el archivo del navegador al `ProductionFileType` del backend. */
const detectFileType = (file: File): ProductionFileType | undefined => {
  if (file.type.startsWith("image/")) return ProductionFileType.photo;
  if (file.type.startsWith("video/")) return ProductionFileType.video;
  if (file.type.startsWith("audio/")) return ProductionFileType.audio;
  if (file.type === "application/pdf") return ProductionFileType.writing;
  return undefined;
};

const ProductionStaffToolbar = ({
  productionId,
  parentId,
  onCreated,
}: Props) => {
  const router = useRouter();
  const folderModal = useDisclosure();
  const [folderName, setFolderName] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goToCreateArticle = () => {
    const query = parentId ? `?parentId=${parentId}` : "";
    router.push(`${PRODUCTIONS}/${productionId}/crear-articulo${query}`);
  };

  const { startUpload } = useUploadThing("fileUploader", {
    onUploadError: (e) => toastifyError(`Error al subir el archivo: ${e.name}`),
  });

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

  const handleFilePicked = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    // Permitir volver a elegir el mismo archivo.
    event.target.value = "";
    if (!file) return;

    const fileType = detectFileType(file);
    if (!fileType) {
      toastifyError("Tipo de archivo no soportado");
      return;
    }

    setBusy(true);
    setUploading(true);
    try {
      const uploaded = await startUpload([file]);
      let key = uploaded?.[0]?.key;
      if (!key) {
        toastifyError("No se pudo subir el archivo");
        return;
      }
      // Convención de Anuncios: al key de un video se le agrega "video".
      if (fileType === ProductionFileType.video) {
        key = `${key}video`;
      }
      const res = await uploadFile({
        productionId,
        parentId,
        fileType,
        key,
        name: file.name,
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess("Archivo subido");
      onCreated();
    } finally {
      setBusy(false);
      setUploading(false);
    }
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
          isDisabled={busy}
          isLoading={uploading}
        >
          {uploading ? "Subiendo…" : "Subir archivo"}
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
          accept="image/*,video/*,audio/*,application/pdf"
          className="hidden"
          onChange={handleFilePicked}
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
