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
  Select,
  SelectItem,
  Switch,
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
import { ProductionCollectionType } from "@/types/productionTypes";
import { COLLECTION_TYPES } from "../../productionCollections";

// Opción "carpeta común" del selector de tipo.
const PLAIN_FOLDER = "folder";

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
  /** Con `type`, la carpeta nueva arranca como esa colección. */
  openFolder: (type?: ProductionCollectionType) => void;
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
  const [folderType, setFolderType] = useState<ProductionCollectionType | null>(
    null
  );
  const [albumName, setAlbumName] = useState("");
  const [albumLoveIt, setAlbumLoveIt] = useState(false);
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
    openFolder: (type?: ProductionCollectionType) => {
      setFolderType(type ?? null);
      folderModal.onOpen();
    },
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
      toastifyError("Elegí al menos una foto o un video");
      return;
    }
    setBusy(true);
    try {
      const folder = await createFolder({
        productionId,
        parentId,
        name: albumName.trim(),
        collectionType: ProductionCollectionType.album,
        loveItEnabled: albumLoveIt,
      });
      if (isProductionActionError(folder)) {
        toastifyError(folder.error);
        return;
      }
      const photos = albumPhotos;
      setAlbumName("");
      setAlbumPhotos([]);
      setAlbumLoveIt(false);
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
        collectionType: folderType ?? undefined,
      });
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        return;
      }
      toastifySuccess(folderType ? "Colección creada" : "Carpeta creada");
      setFolderName("");
      folderModal.onClose();
      // Una colección se abre para empezar a cargarla.
      if (folderType && onOpenFolder) onOpenFolder(res._id);
      else onCreated();
      setFolderType(null);
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
          onPress={() => {
            setFolderType(null);
            folderModal.onOpen();
          }}
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
              <ModalHeader>
                {folderType ? "Nueva colección" : "Nueva carpeta"}
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Nombre"
                  value={folderName}
                  onValueChange={setFolderName}
                />
                <Select
                  label="Tipo"
                  disallowEmptySelection
                  selectedKeys={[folderType ?? PLAIN_FOLDER]}
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string | undefined;
                    setFolderType(
                      !key || key === PLAIN_FOLDER
                        ? null
                        : (key as ProductionCollectionType)
                    );
                  }}
                  description={
                    COLLECTION_TYPES.find((option) => option.key === folderType)
                      ?.description ??
                    "Una carpeta común. Podés convertirla en colección después."
                  }
                >
                  {[
                    <SelectItem key={PLAIN_FOLDER}>📁 Carpeta común</SelectItem>,
                    ...COLLECTION_TYPES.map((option) => (
                      <SelectItem key={option.key}>
                        {`${option.emoji} ${option.label}`}
                      </SelectItem>
                    )),
                  ]}
                </Select>
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
                  Fotos y videos, todos del mismo tamaño y enteros.
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
                          ? "archivo elegido"
                          : "archivos elegidos"
                      } · cambiar`
                    : "Elegir fotos y videos"}
                </Button>
                <div className="flex items-start justify-between gap-4 rounded-xl border border-pink-200 bg-pink-50 p-3 dark:border-pink-900 dark:bg-pink-950/30">
                  <div>
                    <p className="text-sm font-semibold">💖 Activar Love It</p>
                    <p className="text-xs text-default-600">
                      Quien entra pasa las fotos una por una y vota cada una:
                      Fan, Me gusta, Más o menos o No. Lo podés cambiar después.
                    </p>
                  </div>
                  <Switch
                    isSelected={albumLoveIt}
                    onValueChange={setAlbumLoveIt}
                    aria-label="Activar Love It"
                  />
                </div>
                <input
                  ref={albumInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
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
