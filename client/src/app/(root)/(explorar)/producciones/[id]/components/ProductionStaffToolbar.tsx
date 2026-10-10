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
import { deleteFilesService } from "@/app/server/uploadThing";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { ProductionFileType } from "@/types/productionTypes";
import { PRODUCTIONS } from "@/utils/data/urls";
import { INVALID_IMAGE_FORMAT_MESSAGE } from "@/utils/functions/imageFormats";
import {
  detectProductionFileType,
  PRODUCTION_FILE_ACCEPT,
} from "../../productionFiles";

interface Props {
  productionId: string;
  parentId?: string;
  /** Se llama tras crear cualquier ítem para refrescar la grilla. */
  onCreated: () => void;
}

const ProductionStaffToolbar = ({
  productionId,
  parentId,
  onCreated,
}: Props) => {
  const router = useRouter();
  const folderModal = useDisclosure();
  const [folderName, setFolderName] = useState("");
  const [busy, setBusy] = useState(false);
  // Avance de la subida en curso (se puede elegir más de un archivo a la vez).
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    /** Porcentaje del archivo en curso (un video puede tardar minutos). */
    percent: number;
  } | null>(null);
  const uploading = uploadProgress !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goToCreateArticle = () => {
    const query = parentId ? `?parentId=${parentId}` : "";
    router.push(`${PRODUCTIONS}/${productionId}/crear-articulo${query}`);
  };

  // `startUpload` no lanza: avisa por `onUploadError` y resuelve `undefined`.
  const uploadError = useRef<string | null>(null);
  const { startUpload } = useUploadThing("productionFileUploader", {
    uploadProgressGranularity: "fine",
    onUploadProgress: (percent) =>
      setUploadProgress((progress) => progress && { ...progress, percent }),
    onUploadError: (e) => {
      uploadError.current =
        e.code === "TOO_LARGE" || e.message.includes("FileSizeMismatch")
          ? "El archivo supera el tamaño máximo permitido"
          : "No se pudo subir el archivo";
    },
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

  /** Sube un archivo y lo registra en el blog. Devuelve el error, si hubo. */
  const uploadOne = async (file: File): Promise<string | null> => {
    const fileType = detectProductionFileType(file);
    if (!fileType) {
      return file.type.startsWith("image/")
        ? INVALID_IMAGE_FORMAT_MESSAGE
        : "Tipo de archivo no soportado";
    }

    uploadError.current = null;
    const rawKey = (await startUpload([file]))?.[0]?.key;
    if (!rawKey) return uploadError.current ?? "No se pudo subir el archivo";

    // Convención de Anuncios: al key de un video se le agrega "video".
    const key =
      fileType === ProductionFileType.video ? `${rawKey}video` : rawKey;
    const res = await uploadFile({
      productionId,
      parentId,
      fileType,
      key,
      // Tamaño real del archivo para el cupo de almacenamiento por usuario.
      sizeBytes: file.size,
      name: file.name,
    });
    if (isProductionActionError(res)) {
      // El backend rechazó (p. ej. sin espacio). El archivo ya se subió a
      // UploadThing, así que lo borramos para no dejar un huérfano que igual
      // ocuparía storage real. Se borra con el key REAL (sin el sufijo "video").
      deleteFilesService([rawKey]);
      return res.error;
    }
    return null;
  };

  const handleFilesPicked = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    // Permitir volver a elegir los mismos archivos.
    event.target.value = "";
    if (files.length === 0) return;

    setBusy(true);
    let uploadedCount = 0;
    try {
      // De a uno: cada archivo valida su propio cupo en el backend, y si uno
      // falla los demás siguen.
      for (const [index, file] of files.entries()) {
        setUploadProgress({
          current: index + 1,
          total: files.length,
          percent: 0,
        });
        const error = await uploadOne(file);
        if (error) {
          toastifyError(files.length > 1 ? `${file.name}: ${error}` : error);
        } else {
          uploadedCount++;
        }
      }
      if (uploadedCount > 0) {
        toastifySuccess(
          uploadedCount === 1
            ? "Archivo subido"
            : `${uploadedCount} archivos subidos`
        );
        onCreated();
      }
    } finally {
      setBusy(false);
      setUploadProgress(null);
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
