"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError } from "@/utils/functions/toastify";
import {
  createFolder,
  getProductionConsumption,
  getProductionMap,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import {
  ProductionBlogConsumption,
  ProductionItemKind,
  ProductionMapNode,
  ProductionRole,
} from "@/types/productionTypes";
import { CREATE_PRODUCTION, PRODUCTIONS } from "@/utils/data/urls";
import useProductionUpload from "../[id]/components/useProductionUpload";
import { FOLDER_PARAM } from "../productionBrowse";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Qué se envía, para el título ("la imagen", "la valuación"). */
  subject: string;
  /**
   * Arma el archivo recién al confirmar (una valuación se renderiza a PNG en
   * ese momento). Si lanza, se avisa y no se sube nada.
   */
  getFile: () => Promise<File>;
}

type Destination = "root" | "existing" | "new";

const STAFF_ROLES = [ProductionRole.admin, ProductionRole.moderator];

/** Camino de cada carpeta ("Viajes / Europa"), ordenado alfabéticamente. */
const folderPaths = (nodes: ProductionMapNode[]) => {
  const folders = nodes.filter((node) => node.kind === ProductionItemKind.folder);
  const byId = new Map(folders.map((folder) => [folder._id, folder]));
  const pathOf = (folder: ProductionMapNode): string => {
    const parent = folder.parent ? byId.get(folder.parent) : undefined;
    return parent ? `${pathOf(parent)} / ${folder.name}` : folder.name;
  };
  return folders
    .map((folder) => ({ _id: folder._id, path: pathOf(folder) }))
    .sort((a, b) => a.path.localeCompare(b.path, "es"));
};

/**
 * Envía un archivo generado en el Tablero de trabajo (una imagen de Cubito o
 * una Valuación IA) a un blog de Mis Producciones: a la raíz, a una carpeta
 * existente o a una carpeta nueva. Mismo recorrido que guardar un anuncio en
 * una revista.
 */
const SendToBlogModal = ({ isOpen, onClose, subject, getFile }: Props) => {
  const [blogs, setBlogs] = useState<ProductionBlogConsumption[] | null>(null);
  const [productionId, setProductionId] = useState("");
  const [folders, setFolders] = useState<{ _id: string; path: string }[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [destination, setDestination] = useState<Destination>("root");
  const [folderId, setFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [filesLimitEnabled, setFilesLimitEnabled] = useState(false);

  const { uploadFiles, uploadProgress } = useProductionUpload(productionId);

  // Blogs donde el usuario puede cargar contenido (propios o como moderador).
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setSentTo(null);
    getProductionConsumption().then((res) => {
      if (cancelled) return;
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        setBlogs([]);
        return;
      }
      const editable = res.blogs.filter((blog) =>
        STAFF_ROLES.includes(blog.role)
      );
      setBlogs(editable);
      setFilesLimitEnabled(!!res.limits?.filesPerBlogLimitEnabled);
      setProductionId((current) => current || editable[0]?.productionId || "");
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Carpetas del blog elegido.
  useEffect(() => {
    if (!isOpen || !productionId) return;
    let cancelled = false;
    setLoadingFolders(true);
    setFolderId("");
    getProductionMap(productionId).then((res) => {
      if (cancelled) return;
      setFolders(isProductionActionError(res) ? [] : folderPaths(res));
      setLoadingFolders(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, productionId]);

  const selectedBlog = useMemo(
    () => blogs?.find((blog) => blog.productionId === productionId),
    [blogs, productionId]
  );

  const send = async () => {
    if (!productionId) return;
    if (destination === "existing" && !folderId) {
      toastifyError("Elegí una carpeta");
      return;
    }
    if (destination === "new" && !newFolderName.trim()) {
      toastifyError("Escribí el nombre de la carpeta nueva");
      return;
    }
    setBusy(true);
    try {
      let file: File;
      try {
        file = await getFile();
      } catch {
        toastifyError(`No se pudo preparar ${subject} para enviar`);
        return;
      }

      let parentId: string | undefined;
      if (destination === "existing") parentId = folderId;
      if (destination === "new") {
        const folder = await createFolder({
          productionId,
          name: newFolderName.trim(),
        });
        if (isProductionActionError(folder)) {
          toastifyError(folder.error);
          return;
        }
        parentId = folder._id;
      }

      // `uploadFiles` avisa por su cuenta si el blog rechaza el archivo.
      if ((await uploadFiles([file], parentId)) > 0) {
        setSentTo(
          `${PRODUCTIONS}/${productionId}${
            parentId ? `?${FOLDER_PARAM}=${parentId}` : ""
          }`
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={!busy}
      hideCloseButton={busy}
    >
      <ModalContent>
        <ModalHeader>Enviar {subject} a mi blog</ModalHeader>
        <ModalBody className="gap-4">
          {sentTo ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <span className="text-4xl" aria-hidden>
                ✅
              </span>
              <p className="text-sm font-medium">
                Listo, ya está en {selectedBlog?.title ?? "tu blog"}.
              </p>
              <Link href={sentTo} size="sm">
                Ver en el blog
              </Link>
            </div>
          ) : !blogs ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <p className="text-sm text-default-600">
                Todavía no tenés un blog donde guardar contenido.
              </p>
              <Link href={CREATE_PRODUCTION} size="sm">
                Crear mi blog
              </Link>
            </div>
          ) : (
            <>
              <Select
                label="Blog"
                disallowEmptySelection
                selectedKeys={productionId ? [productionId] : []}
                onSelectionChange={(keys) =>
                  setProductionId(String(Array.from(keys)[0] ?? ""))
                }
                isDisabled={busy}
              >
                {blogs.map((blog) => (
                  <SelectItem key={blog.productionId}>{blog.title}</SelectItem>
                ))}
              </Select>

              <RadioGroup
                label="¿Dónde lo guardamos?"
                value={destination}
                onValueChange={(value) => setDestination(value as Destination)}
                isDisabled={busy}
              >
                <Radio value="root">En el inicio del blog</Radio>
                <Radio value="existing" isDisabled={folders.length === 0}>
                  En una carpeta existente
                  {!loadingFolders && folders.length === 0 && (
                    <span className="text-xs text-default-400">
                      {" "}
                      (el blog no tiene carpetas)
                    </span>
                  )}
                </Radio>
                <Radio value="new">En una carpeta nueva</Radio>
              </RadioGroup>

              {destination === "existing" && (
                <Select
                  label="Carpeta"
                  selectedKeys={folderId ? [folderId] : []}
                  onSelectionChange={(keys) =>
                    setFolderId(String(Array.from(keys)[0] ?? ""))
                  }
                  isLoading={loadingFolders}
                  isDisabled={busy}
                >
                  {folders.map((folder) => (
                    <SelectItem key={folder._id}>{folder.path}</SelectItem>
                  ))}
                </Select>
              )}
              {destination === "new" && (
                <Input
                  label="Nombre de la carpeta nueva"
                  value={newFolderName}
                  onValueChange={setNewFolderName}
                  maxLength={100}
                  isDisabled={busy}
                />
              )}

              {filesLimitEnabled &&
                selectedBlog &&
                selectedBlog.filesAvailable <= 0 && (
                <p className="text-xs text-danger">
                  Este blog llegó al límite de archivos de tu plan.
                </p>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={busy}>
            {sentTo ? "Cerrar" : "Cancelar"}
          </Button>
          {!sentTo && !!blogs?.length && (
            <PrimaryButton onClick={send} isDisabled={busy || !productionId}>
              {uploadProgress
                ? `Subiendo… ${uploadProgress.percent}%`
                : busy
                  ? "Preparando…"
                  : "Enviar al blog"}
            </PrimaryButton>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SendToBlogModal;
