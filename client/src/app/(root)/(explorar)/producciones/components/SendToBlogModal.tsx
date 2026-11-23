"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import { FaChevronLeft, FaFolder, FaFolderPlus, FaHouse } from "react-icons/fa6";
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
  ProductionOwnerType,
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

/** Destino elegido: el inicio del blog, una carpeta o una carpeta nueva. */
type Target = { productionId: string; folderId: "root" | "new" | string };

type FolderOption = { _id: string; path: string; depth: number };

const STAFF_ROLES = [ProductionRole.admin, ProductionRole.moderator];

/**
 * Carpetas en el orden del árbol (cada una debajo de su carpeta madre), con
 * su camino completo ("Viajes / Europa") y su profundidad para sangrarlas.
 */
const folderTree = (nodes: ProductionMapNode[]): FolderOption[] => {
  const folders = nodes.filter((node) => node.kind === ProductionItemKind.folder);
  const ids = new Set(folders.map((folder) => folder._id));
  const children = new Map<string | null, ProductionMapNode[]>();
  folders.forEach((folder) => {
    const parent = folder.parent && ids.has(folder.parent) ? folder.parent : null;
    children.set(parent, [...(children.get(parent) ?? []), folder]);
  });
  const result: FolderOption[] = [];
  const walk = (parent: string | null, prefix: string, depth: number) => {
    (children.get(parent) ?? [])
      .sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true }))
      .forEach((folder) => {
        const path = prefix ? `${prefix} / ${folder.name}` : folder.name;
        result.push({ _id: folder._id, path, depth });
        walk(folder._id, path, depth + 1);
      });
  };
  walk(null, "", 0);
  return result;
};

const blogSubtitle = (blog: ProductionBlogConsumption) => {
  const owner =
    blog.ownerType === ProductionOwnerType.Group ? "Blog de grupo" : "Blog personal";
  return blog.role === ProductionRole.moderator ? `${owner} · moderador` : owner;
};

/** Opción de destino, con el mismo aspecto que una sección de revista. */
const DestinationButton = ({
  selected,
  onPress,
  icon,
  children,
  depth = 0,
  isDisabled,
}: {
  selected: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  depth?: number;
  isDisabled?: boolean;
}) => (
  <Button
    variant="bordered"
    startContent={icon}
    onPress={onPress}
    isDisabled={isDisabled}
    style={depth ? { marginLeft: `${Math.min(depth, 4) * 12}px` } : undefined}
    className={`justify-start flex-shrink-0 h-10 ${
      depth ? "w-auto" : "w-full"
    } ${selected ? "border-primary text-primary" : ""}`}
  >
    <span className="truncate">{children}</span>
  </Button>
);

/**
 * Envía un archivo generado en el Tablero de trabajo (una imagen de Cubito o
 * una Valuación IA) a un blog de Mis Producciones. Mismo formato que guardar
 * un anuncio en una revista: la lista de tus blogs, cada uno se despliega con
 * sus carpetas (como las secciones de una revista), elegís el destino y
 * confirmás. También se puede crear una carpeta nueva en el momento.
 */
const SendToBlogModal = ({ isOpen, onClose, subject, getFile }: Props) => {
  const [blogs, setBlogs] = useState<ProductionBlogConsumption[] | null>(null);
  const [filesLimitEnabled, setFilesLimitEnabled] = useState(false);
  // Carpetas por blog, cargadas al desplegarlo (null = cargando).
  const [foldersByBlog, setFoldersByBlog] = useState<Record<string, FolderOption[] | null>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<{ url: string; blog: string } | null>(null);

  const { uploadFiles, uploadProgress } = useProductionUpload(target?.productionId ?? "");

  // Blogs cuyas carpetas ya se pidieron (para no repetir la consulta).
  const requestedFolders = useRef(new Set<string>());
  const loadFolders = useCallback((productionId: string, force = false) => {
    if (!force && requestedFolders.current.has(productionId)) return;
    requestedFolders.current.add(productionId);
    setFoldersByBlog((prev) => ({ ...prev, [productionId]: null }));
    getProductionMap(productionId).then((res) => {
      setFoldersByBlog((current) => ({
        ...current,
        [productionId]: isProductionActionError(res) ? [] : folderTree(res),
      }));
    });
  }, []);

  const expand = useCallback(
    (productionId: string | null) => {
      setExpanded(productionId);
      if (productionId) loadFolders(productionId);
    },
    [loadFolders]
  );

  // Blogs donde el usuario puede cargar contenido (propios o como moderador).
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setSentTo(null);
    setTarget(null);
    setNewFolderName("");
    setFoldersByBlog({});
    requestedFolders.current.clear();
    setBlogs(null);
    getProductionConsumption().then((res) => {
      if (cancelled) return;
      if (isProductionActionError(res)) {
        toastifyError(res.error);
        setBlogs([]);
        return;
      }
      const editable = res.blogs.filter((blog) => STAFF_ROLES.includes(blog.role));
      setBlogs(editable);
      setFilesLimitEnabled(!!res.limits?.filesPerBlogLimitEnabled);
      // Se abre el primer blog con su inicio elegido.
      if (editable.length > 0) {
        expand(editable[0].productionId);
        setTarget({ productionId: editable[0].productionId, folderId: "root" });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, expand]);

  const select = (productionId: string, folderId: Target["folderId"]) =>
    setTarget((current) =>
      current?.productionId === productionId && current.folderId === folderId
        ? null
        : { productionId, folderId }
    );

  const isSelected = (productionId: string, folderId: Target["folderId"]) =>
    target?.productionId === productionId && target.folderId === folderId;

  const targetBlog = blogs?.find((blog) => blog.productionId === target?.productionId);
  const blogIsFull =
    filesLimitEnabled && !!targetBlog && targetBlog.filesAvailable <= 0;

  const send = async () => {
    if (!target) return;
    const { productionId, folderId } = target;
    if (folderId === "new" && !newFolderName.trim()) {
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
      if (folderId === "new") {
        const folder = await createFolder({ productionId, name: newFolderName.trim() });
        if (isProductionActionError(folder)) {
          toastifyError(folder.error);
          return;
        }
        parentId = folder._id;
        // Si el archivo no entra, la carpeta queda creada: se la ofrece como existente.
        setTarget({ productionId, folderId: folder._id });
        setNewFolderName("");
        loadFolders(productionId, true);
      } else if (folderId !== "root") {
        parentId = folderId;
      }

      // `uploadFiles` avisa por su cuenta si el blog rechaza el archivo.
      if ((await uploadFiles([file], parentId)) > 0) {
        setSentTo({
          url: `${PRODUCTIONS}/${productionId}${parentId ? `?${FOLDER_PARAM}=${parentId}` : ""}`,
          blog: targetBlog?.title ?? "tu blog",
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const targetLabel = (() => {
    if (!target || !targetBlog) return null;
    if (target.folderId === "root") return `${targetBlog.title} · inicio`;
    if (target.folderId === "new")
      return `${targetBlog.title} · carpeta nueva${newFolderName.trim() ? ` "${newFolderName.trim()}"` : ""}`;
    const folder = foldersByBlog[target.productionId]?.find((f) => f._id === target.folderId);
    return folder ? `${targetBlog.title} · ${folder.path}` : targetBlog.title;
  })();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={!busy}
      hideCloseButton={busy}
      scrollBehavior="inside"
      size="md"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-0.5">
          <span>Enviar {subject} a un blog</span>
          {!sentTo && !!blogs?.length && (
            <span className="text-xs font-normal text-default-500">
              Elegí el blog y la carpeta donde guardarla.
            </span>
          )}
        </ModalHeader>
        <ModalBody className="gap-2">
          {sentTo ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <span className="text-4xl" aria-hidden>
                ✅
              </span>
              <p className="text-sm font-medium">Listo, ya está en {sentTo.blog}.</p>
              <Link href={sentTo.url} size="sm">
                Ver en el blog
              </Link>
            </div>
          ) : !blogs ? (
            <div className="flex justify-center py-8">
              <Spinner color="warning" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <p className="text-sm text-default-600">
                Todavía no tenés un blog donde guardar contenido.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs">Tus blogs</p>
              <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto overflow-x-hidden pr-1">
                {blogs.map((blog) => {
                  const folders = foldersByBlog[blog.productionId];
                  const full = filesLimitEnabled && blog.filesAvailable <= 0;
                  const hasTarget = target?.productionId === blog.productionId;
                  return (
                    <Accordion
                      key={blog.productionId}
                      variant="bordered"
                      isCompact
                      selectedKeys={expanded === blog.productionId ? [blog.productionId] : []}
                      onSelectionChange={(keys) => {
                        const open = Array.from(keys as Set<string>)[0] ?? null;
                        expand(open ? String(open) : null);
                      }}
                    >
                      <AccordionItem
                        key={blog.productionId}
                        HeadingComponent="h6"
                        indicator={<FaChevronLeft className="size-3" />}
                        title={blog.title}
                        subtitle={`${blogSubtitle(blog)}${full ? " · sin lugar para archivos" : ""}`}
                        classNames={{
                          title: `text-small font-normal ${hasTarget ? "text-primary" : ""}`,
                          subtitle: `text-xs ${full ? "text-danger" : ""}`,
                          content: "flex flex-col gap-1 pb-3",
                        }}
                      >
                        <DestinationButton
                          selected={isSelected(blog.productionId, "root")}
                          onPress={() => select(blog.productionId, "root")}
                          icon={<FaHouse className="min-w-4" />}
                          isDisabled={busy}
                        >
                          <span className="italic">Inicio del blog</span>
                        </DestinationButton>

                        {folders === null || folders === undefined ? (
                          <div className="flex justify-center py-2">
                            <Spinner size="sm" color="warning" />
                          </div>
                        ) : (
                          folders.map((folder) => (
                            <DestinationButton
                              key={folder._id}
                              depth={folder.depth}
                              selected={isSelected(blog.productionId, folder._id)}
                              onPress={() => select(blog.productionId, folder._id)}
                              icon={<FaFolder className="min-w-4 text-warning" />}
                              isDisabled={busy}
                            >
                              {folder.path.split(" / ").pop()}
                            </DestinationButton>
                          ))
                        )}

                        <DestinationButton
                          selected={isSelected(blog.productionId, "new")}
                          onPress={() => select(blog.productionId, "new")}
                          icon={<FaFolderPlus className="min-w-4" />}
                          isDisabled={busy}
                        >
                          Carpeta nueva
                        </DestinationButton>
                        {isSelected(blog.productionId, "new") && (
                          <Input
                            size="sm"
                            autoFocus
                            label="Nombre de la carpeta"
                            value={newFolderName}
                            onValueChange={setNewFolderName}
                            maxLength={100}
                            isDisabled={busy}
                          />
                        )}
                      </AccordionItem>
                    </Accordion>
                  );
                })}
              </div>

              {targetLabel && (
                <p className="text-xs text-default-500">
                  Se guarda en: <span className="font-medium text-default-700">{targetLabel}</span>
                </p>
              )}
              {blogIsFull && (
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
          {!sentTo && blogs && blogs.length === 0 && (
            <PrimaryButton as={Link} href={CREATE_PRODUCTION}>
              Crear blog
            </PrimaryButton>
          )}
          {!sentTo && !!blogs?.length && (
            <PrimaryButton
              onPress={send}
              isDisabled={busy || !target || blogIsFull}
              isLoading={busy}
            >
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
