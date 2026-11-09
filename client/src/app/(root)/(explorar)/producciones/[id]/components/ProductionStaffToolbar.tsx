"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
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
import {
  FaFolderPlus,
  FaUpload,
  FaFileMedical,
  FaImages,
} from "react-icons/fa";
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
  /** Tras crear un álbum, abre su carpeta. */
  onOpenFolder?: (folderId: string) => void;
}

/** Acciones de creación, también disponibles desde el súper botón Crear. */
export interface ProductionStaffToolbarHandle {
  openFolder: () => void;
  openAlbum: () => void;
  pickFiles: () => void;
  createArticle: () => void;
}

const ProductionStaffToolbar = forwardRef<
  ProductionStaffToolbarHandle,
  Props
>(function ProductionStaffToolbar(
  { productionId, parentId, onCreated, uploadFiles, uploadProgress, onOpenFolder },
  ref
) {
  const router = useRouter();
  const folderModal = useDisclosure();
  const albumModal = useDisclosure();
  const [folderName, setFolderName] = useState("");
  const [albumName, setAlbumName] = useState("");
  const [albumPhotos, setAlbumPhotos] = useState<File[]>([]);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const uploading = uploadProgress !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goToCreateArticle = () => {
    const query = parentId ? `?parentId=${parentId}` : "";
    router.push(`${PRODUCTIONS}/${productionId}/crear-articulo${query}`);
  };

  useImperativeHandle(ref, () => ({
    openFolder: folderModal.onOpen,
    openAlbum: albumModal.onOpen,
    pickFiles: () => fileInputRef.current?.click(),
    createArticle: goToCreateArticle,
  }));

  /** Álbum = carpeta nueva con las fotos elegidas adentro. */
  const handleCreateAlbum = async () => {
    if (!albumName.trim()) {
      toastifyError("El nombre del álbum es obligatorio");
      return;
    }
    if (albumPhotos.length === 0) {
      toastifyError("Elegí al menos una foto");
      return;
    }
    setBusy(true);
    try {
      const folder = await createFolder({
        productionId,
        parentId,
        name: albumName.trim(),
      });
      if (isProductionActionError(folder)) {
        toastifyError(folder.error);
        return;
      }
      const photos = albumPhotos;
      setAlbumName("");
      setAlbumPhotos([]);
      albumModal.onClose();
      onCreated();
      // La subida muestra su progreso en el botón "Subir archivos".
      await uploadFiles(photos, folder._id);
      if (onOpenFolder) onOpenFolder(folder._id);
      else onCreated();
    } finally {
      setBusy(false);
    }
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
        <Button
          startContent={<FaImages />}
          variant="flat"
          onPress={albumModal.onOpen}
          isDisabled={busy || uploading}
        >
          Nuevo álbum
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

      {/* Modal crear álbum: carpeta + fotos */}
      <Modal
        isOpen={albumModal.isOpen}
        onOpenChange={albumModal.onOpenChange}
        onClose={() => setAlbumPhotos([])}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Nuevo álbum
                <span className="text-xs font-normal text-default-500">
                  Se crea una carpeta con las fotos que elijas.
                </span>
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Nombre del álbum"
                  value={albumName}
                  onValueChange={setAlbumName}
                />
                <Button
                  variant="bordered"
                  startContent={<FaImages />}
                  onPress={() => albumInputRef.current?.click()}
                  isDisabled={busy}
                >
                  {albumPhotos.length > 0
                    ? `${albumPhotos.length} ${
                        albumPhotos.length === 1
                          ? "foto elegida"
                          : "fotos elegidas"
                      } · cambiar`
                    : "Elegir fotos"}
                </Button>
                <input
                  ref={albumInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    setAlbumPhotos(Array.from(event.target.files ?? []));
                    event.target.value = "";
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} isDisabled={busy}>
                  Cancelar
                </Button>
                <PrimaryButton onClick={handleCreateAlbum} disabled={busy}>
                  {busy ? "Creando…" : "Crear álbum"}
                </PrimaryButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
});

export default ProductionStaffToolbar;
