"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumbs,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Input,
  Select,
  SelectItem,
  Slider,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaCog,
  FaEllipsisH,
  FaEye,
  FaFlag,
  FaFolderOpen,
  FaKey,
  FaList,
  FaLock,
  FaPen,
  FaReceipt,
  FaSearch,
  FaShoppingCart,
  FaSitemap,
  FaThLarge,
  FaTrash,
  FaUpload,
  FaUserLock,
  FaUserShield,
} from "react-icons/fa";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import {
  toastifyError,
  toastifySuccess,
  toastifyWarn,
} from "@/utils/functions/toastify";
import {
  ProductionItemKind,
  ProductionItemResponse,
  ProductionItemsResult,
  ProductionLockReason,
} from "@/types/productionTypes";
import {
  getProductionItems,
  deleteProduction,
  moveProductionItems,
} from "@/app/server/productionActions";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { resolveProductionFileUrl } from "../../productionMedia";
import {
  filterAndSortItems,
  FOLDER_PARAM,
  isFileDrag,
  isItemsDrag,
  PRODUCTION_ITEMS_DRAG_TYPE,
  PRODUCTION_SORTS,
  PREVIEW_PARAM,
  PREVIEW_VALUE,
  PRODUCTION_TYPE_FILTERS,
  ProductionSort,
  ProductionTypeFilter,
  ProductionViewMode,
} from "../../productionBrowse";
import { EDIT_PRODUCTION, PRODUCTIONS } from "@/utils/data/urls";
import { isOnlyMe } from "../../productionVisibility";
import { productionFolderPath } from "../../productionShare";
import ShareLinkButton from "../../components/ShareLinkButton";
import ProductionItemCard from "./ProductionItemCard";
import ProductionStaffToolbar from "./ProductionStaffToolbar";
import AccessKeyModal from "./AccessKeyModal";
import ProductionAccessSettings from "./ProductionAccessSettings";
import TicketManagerModal from "./TicketManagerModal";
import TicketCheckoutModal from "./TicketCheckoutModal";
import TicketSalesModal from "./TicketSalesModal";
import FanButton from "./FanButton";
import ProductionCommunity from "./ProductionCommunity";
import ProductionRating from "./ProductionRating";
import ReportModal from "./ReportModal";
import MoveItemsModal from "./MoveItemsModal";
import DeleteBlogModal from "./DeleteBlogModal";
import ProductionMapModal from "./ProductionMapModal";
import ReceivedReportsModal from "./ReceivedReportsModal";
import useProductionUpload from "./useProductionUpload";

const VIEW_MODE_STORAGE_KEY = "production-view-mode";
const ICON_SIZE_STORAGE_KEY = "production-icon-size";
// Escala de la grilla: de íconos chicos a tarjetas grandes. Por debajo de
// `compact` los controles de staff de cada tarjeta se muestran sólo con ícono.
const ICON_SIZE = { min: 100, max: 300, step: 20, default: 140, compact: 200 };

interface Props {
  initial: ProductionItemsResult;
  /** Carpeta con la que se abrió el blog (`?carpeta=`). */
  initialParentId?: string;
  /** El blog se abrió en vista previa de visitante (`?vista=visitante`). */
  initialPreview?: boolean;
}

/** Destino de un arrastre fuera de la grilla (subir un nivel o a la raíz). */
const DropChip = ({
  label,
  onDrop,
}: {
  label: string;
  onDrop: (event: React.DragEvent) => void;
}) => {
  const [active, setActive] = useState(false);
  return (
    <div
      onDragOver={(event) => {
        if (!isItemsDrag(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(event) => {
        setActive(false);
        if (!isItemsDrag(event)) return;
        event.preventDefault();
        onDrop(event);
      }}
      className={`flex max-w-[12rem] items-center gap-2 rounded-full border-2 border-dashed px-4 py-2 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-white"
          : "border-default-300 bg-content1"
      }`}
    >
      <FaFolderOpen className="shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
};

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

// "Este blog tiene 3 archivos y tiene 2 carpetas con 5 archivos dentro."
// Los artículos cuentan como archivos.
const blogContentSummary = (
  rootFiles: number,
  folders: number,
  filesInFolders: number,
) => {
  const loose = plural(rootFiles, "archivo", "archivos");
  if (folders <= 0) return `Este blog tiene ${loose}.`;
  const inFolders = `${plural(folders, "carpeta", "carpetas")} con ${plural(
    filesInFolders,
    "archivo",
    "archivos",
  )} dentro`;
  return rootFiles > 0
    ? `Este blog tiene ${loose} y tiene ${inFolders}.`
    : `Este blog tiene ${inFolders}.`;
};

/**
 * Vista de un blog de Mis Producciones: header, navegación por carpetas
 * (flechas + breadcrumb), explorador del nivel (búsqueda, filtros, grilla o
 * lista) y controles de staff según `viewer`: selección, mover y arrastrar.
 */
const ProductionBlog = ({
  initial,
  initialParentId,
  initialPreview = false,
}: Props) => {
  const router = useRouter();
  const [data, setData] = useState<ProductionItemsResult>(initial);
  const [currentParentId, setCurrentParentId] = useState<string | undefined>(
    initialParentId,
  );
  const [loading, setLoading] = useState(false);

  // Historial de carpetas visitadas, para las flechas Atrás / Adelante.
  const [history, setHistory] = useState<{
    stack: (string | undefined)[];
    index: number;
  }>({ stack: [initialParentId], index: 0 });

  const production = data.production;
  const isStaffViewer = !!production.viewer?.canEdit;
  // Vista previa: el staff ve el blog sin sus controles, como un visitante.
  const [previewMode, setPreviewMode] = useState(
    initialPreview && isStaffViewer,
  );
  const canEdit = isStaffViewer && !previewMode;
  const canManageAccess = !!production.viewer?.canManageAccess && !previewMode;

  // Búsqueda, filtro, orden y tipo de vista del nivel actual.
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductionTypeFilter>("all");
  const [sort, setSort] = useState<ProductionSort>("recent");
  const [viewMode, setViewMode] = useState<ProductionViewMode>("grid");
  useEffect(() => {
    if (localStorage.getItem(VIEW_MODE_STORAGE_KEY) === "list") {
      setViewMode("list");
    }
  }, []);
  // Tamaño de los íconos de la grilla (ancho mínimo de cada tarjeta, en px).
  const [iconSize, setIconSize] = useState(ICON_SIZE.default);
  useEffect(() => {
    const stored = Number(localStorage.getItem(ICON_SIZE_STORAGE_KEY));
    if (stored >= ICON_SIZE.min && stored <= ICON_SIZE.max) {
      setIconSize(stored);
    }
  }, []);
  const changeIconSize = (size: number) => {
    setIconSize(size);
    localStorage.setItem(ICON_SIZE_STORAGE_KEY, String(size));
  };
  const changeViewMode = (mode: ProductionViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  };

  // Selección múltiple (staff) y destino del "Mover".
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [itemsToMove, setItemsToMove] = useState<ProductionItemResponse[]>([]);
  const moveModal = useDisclosure();

  // Arrastre: ítems del blog (mover) o archivos del escritorio (subir).
  const draggingIds = useRef<string[]>([]);
  const [internalDrag, setInternalDrag] = useState(false);
  const [fileDropActive, setFileDropActive] = useState(false);
  const fileDragDepth = useRef(0);
  const { uploadFiles, uploadProgress } = useProductionUpload(production._id);

  // Se incrementa al reseñar para que la lista de reseñas se vuelva a pedir.
  const [communityVersion, setCommunityVersion] = useState(0);

  const accessKeyModal = useDisclosure();
  const accessSettings = useDisclosure();
  const blogTicketModal = useDisclosure();
  const salesModal = useDisclosure();
  const reportModal = useDisclosure();
  const levelCheckout = useDisclosure();
  const deleteBlogModal = useDisclosure();
  const mapModal = useDisclosure();
  const receivedReportsModal = useDisclosure();

  // Si el blog está bloqueado por clave, abrir el modal de ingreso.
  const lockedByKey =
    production.viewer?.lockReason === ProductionLockReason.accessKey;
  useEffect(() => {
    if (lockedByKey) {
      accessKeyModal.onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedByKey]);

  // La carpeta abierta y la vista previa viajan en la URL: así se conservan al
  // recargar y al volver desde el detalle de un archivo.
  const syncUrl = (parentId: string | undefined, preview: boolean) => {
    const params = new URLSearchParams(window.location.search);
    if (parentId) params.set(FOLDER_PARAM, parentId);
    else params.delete(FOLDER_PARAM);
    if (preview) params.set(PREVIEW_PARAM, PREVIEW_VALUE);
    else params.delete(PREVIEW_PARAM);
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  };

  /** Carga un nivel del árbol. Devuelve si se pudo. */
  const loadLevel = useCallback(
    async (parentId?: string): Promise<boolean> => {
      setLoading(true);
      try {
        const res = await getProductionItems(production._id, parentId);
        if (isProductionActionError(res)) {
          toastifyError(res.error);
          return false;
        }
        setData(res);
        setCurrentParentId(parentId);
        setSelectedIds(new Set());
        return true;
      } finally {
        setLoading(false);
      }
    },
    [production._id],
  );

  /** Abre una carpeta (o la raíz) y la suma al historial. */
  const openLevel = async (parentId?: string) => {
    if ((parentId ?? null) === (currentParentId ?? null)) return;
    if (!(await loadLevel(parentId))) return;
    setSearch("");
    syncUrl(parentId, previewMode);
    setHistory(({ stack, index }) => ({
      stack: [...stack.slice(0, index + 1), parentId],
      index: index + 1,
    }));
  };

  const canGoBack = history.index > 0;
  const canGoForward = history.index < history.stack.length - 1;
  const stepHistory = async (step: -1 | 1) => {
    const index = history.index + step;
    if (index < 0 || index >= history.stack.length) return;
    const parentId = history.stack[index];
    if (!(await loadLevel(parentId))) return;
    setSearch("");
    syncUrl(parentId, previewMode);
    setHistory((current) => ({ ...current, index }));
  };

  const refreshLevel = () => loadLevel(currentParentId);

  const reloadBlog = () => {
    router.refresh();
    refreshLevel();
  };

  const togglePreview = () => {
    const next = !previewMode;
    setPreviewMode(next);
    setSelectedIds(new Set());
    syncUrl(currentParentId, next);
  };

  const handleOpen = (item: ProductionItemResponse) => {
    if (item.kind === ProductionItemKind.folder) {
      openLevel(item._id);
      return;
    }
    // Archivos y artículos: al detalle del ítem.
    router.push(
      `${PRODUCTIONS}/${production._id}/item/${item._id}${
        previewMode ? `?${PREVIEW_PARAM}=${PREVIEW_VALUE}` : ""
      }`,
    );
  };

  const handleDeleteBlog = async () => {
    const res = await deleteProduction(production._id);
    if (isProductionActionError(res)) {
      toastifyError(res.error);
      return;
    }
    router.push(PRODUCTIONS);
    router.refresh();
  };

  // --- Selección y mover -----------------------------------------------------

  const toggleSelect = (item: ProductionItemResponse) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (!next.delete(item._id)) next.add(item._id);
      return next;
    });

  const openMoveModal = (items: ProductionItemResponse[]) => {
    if (items.length === 0) return;
    setItemsToMove(items);
    moveModal.onOpen();
  };

  /** Mueve directo, sin modal (arrastrar y soltar). */
  const moveTo = async (itemIds: string[], targetParentId?: string) => {
    const res = await moveProductionItems(
      production._id,
      itemIds,
      targetParentId,
    );
    if (isProductionActionError(res)) {
      toastifyError(res.error);
      return;
    }
    if (res > 0) {
      toastifySuccess(
        res === 1 ? "Elemento movido" : `${res} elementos movidos`,
      );
    }
    refreshLevel();
  };

  // --- Arrastrar y soltar ----------------------------------------------------

  const handleDragStartItem = (
    item: ProductionItemResponse,
    event: React.DragEvent,
  ) => {
    // Si el ítem está en la selección se arrastra la selección entera.
    const ids = selectedIds.has(item._id) ? [...selectedIds] : [item._id];
    draggingIds.current = ids;
    event.dataTransfer.setData(PRODUCTION_ITEMS_DRAG_TYPE, JSON.stringify(ids));
    event.dataTransfer.effectAllowed = "move";
    // Fuera del `dragstart`: tocar el DOM en ese mismo evento cancela el
    // arrastre en Chrome.
    setTimeout(() => setInternalDrag(true), 0);
  };

  const endDrag = () => {
    draggingIds.current = [];
    setInternalDrag(false);
    fileDragDepth.current = 0;
    setFileDropActive(false);
  };

  /** Soltaron algo en una carpeta (o en un nivel): mover ítems o subir archivos. */
  const handleDrop = async (
    targetParentId: string | undefined,
    event: React.DragEvent,
  ) => {
    if (isItemsDrag(event)) {
      const ids = [...draggingIds.current];
      endDrag();
      if (ids.length > 0) await moveTo(ids, targetParentId);
      return;
    }
    if (isFileDrag(event)) {
      const files = Array.from(event.dataTransfer.files);
      endDrag();
      if ((await uploadFiles(files, targetParentId)) > 0) refreshLevel();
    }
  };

  // En vista previa las acciones de visitante (fan, reseñar, comentar,
  // denunciar) se ven pero no se ejecutan: avisan que es una vista previa.
  const previewBlocked = previewMode
    ? () =>
        toastifyWarn(
          "Estás en vista de visitante: esta acción no está disponible. Tocá «Volver a editar» para salir.",
          "production-preview-blocked",
        )
    : undefined;

  // Menú de opciones del blog. Lo de staff primero; "Denunciar" va al final y
  // sólo para quien no es parte del blog.
  const canReport = !isStaffViewer || previewMode;
  const blogOptions: {
    key: string;
    label: string;
    description?: string;
    icon: React.ReactNode;
    onAction: () => void;
    danger?: boolean;
    divider?: boolean;
  }[] = [
    ...(canManageAccess
      ? [
          {
            key: "map",
            label: "Mapa de tickets",
            description: "Qué es gratis y qué es pago",
            icon: <FaSitemap />,
            onAction: mapModal.onOpen,
          },
          {
            key: "access",
            label: "Alcance y clave",
            description: "Quién lo ve: público, contactos… o sólo yo",
            icon: <FaKey />,
            onAction: accessSettings.onOpen,
          },
          {
            key: "sales",
            label: "Ventas de tickets",
            icon: <FaReceipt />,
            onAction: salesModal.onOpen,
          },
        ]
      : []),
    ...(canEdit
      ? [
          {
            key: "edit",
            label: "Editar blog",
            icon: <FaPen />,
            onAction: () => router.push(`${EDIT_PRODUCTION}/${production._id}`),
          },
        ]
      : []),
    ...(canManageAccess
      ? [
          {
            key: "reports",
            label: "Denuncias recibidas",
            icon: <FaUserShield />,
            onAction: receivedReportsModal.onOpen,
            divider: !!production.viewer?.canDelete,
          },
        ]
      : []),
    ...(canEdit && production.viewer?.canDelete
      ? [
          {
            key: "delete",
            label: "Eliminar blog",
            icon: <FaTrash />,
            onAction: deleteBlogModal.onOpen,
            danger: true,
          },
        ]
      : []),
    ...(canReport
      ? [
          {
            key: "report",
            label: "Denunciar",
            icon: <FaFlag />,
            onAction: previewBlocked ?? reportModal.onOpen,
          },
        ]
      : []),
  ];

  const ownerName =
    production.ownerInfo?.businessName ||
    [production.ownerInfo?.name, production.ownerInfo?.lastName]
      .filter(Boolean)
      .join(" ") ||
    (production.ownerInfo?.username
      ? `@${production.ownerInfo.username}`
      : null);

  const visibleItems = useMemo(
    () => filterAndSortItems(data.items, { search, type: typeFilter, sort }),
    [data.items, search, typeFilter, sort],
  );
  const selectedItems = data.items.filter((item) => selectedIds.has(item._id));
  const hasFilters = search.trim() !== "" || typeFilter !== "all";
  const parentOfCurrent = data.breadcrumb.at(-2)?._id;

  // Ítems de este nivel bloqueados por un ticket heredado (del blog o de la
  // carpeta donde estamos): se compra una sola vez, desde el aviso del nivel.
  const inheritedLocked = data.items.filter(
    (item) =>
      !item.access?.canViewContent &&
      item.access?.lockReason === ProductionLockReason.ticket &&
      !!item.access.ticket &&
      item.access.ticket.target !== item._id,
  );
  const levelTicket = inheritedLocked[0]?.access.ticket ?? null;
  const levelTicketIsBlog = !!levelTicket && !levelTicket.target;
  const rootFilesCount = production.rootFilesCount ?? 0;
  const lockedFolders = inheritedLocked.filter(
    (item) => item.kind === ProductionItemKind.folder,
  ).length;

  const blogInitial = production.title?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Vista previa de visitante (staff) */}
      {previewMode && (
        <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 backdrop-blur">
          <div className="flex items-start gap-3">
            <FaEye className="mt-1 text-primary" />
            <div>
              <p className="text-sm font-medium">
                Estás viendo el blog como un visitante
              </p>
              <p className="text-xs text-default-600">
                Se ocultan tus controles de edición y las acciones de visitante
                (fan, reseñar, comentar, denunciar) no se ejecutan. El contenido
                con alcance
                restringido, clave o ticket se muestra abierto porque sos parte
                del blog.
              </p>
            </div>
          </div>
          <PrimaryButton onClick={togglePreview}>Volver a editar</PrimaryButton>
        </div>
      )}

      {/* Header: tarjeta con portada cuadrada, título, acciones y estadísticas */}
      <header className="w-full overflow-hidden rounded-2xl border border-default-200 bg-content1 shadow-sm">
        <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-6">
          {/* Portada cuadrada (respeta su relación de aspecto) */}
          <div className="mx-auto aspect-square w-40 shrink-0 overflow-hidden rounded-xl border border-default-200 bg-gradient-to-br from-primary/10 via-secondary/5 to-default-100 shadow-sm sm:mx-0 sm:w-44">
            {production.headerPhotoKey ? (
              <Image
                removeWrapper
                alt={production.title}
                src={resolveProductionFileUrl(production.headerPhotoKey)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-default-800">
                {blogInitial}
              </div>
            )}
          </div>

          {/* Info + acciones */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold leading-tight sm:text-2xl">
                  {production.title}
                </h2>
                {isOnlyMe(production.visibility) && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color="secondary"
                    startContent={<FaUserLock className="ml-1" />}
                    className="mt-1"
                  >
                    Sólo yo · privado
                  </Chip>
                )}
                {production.description && (
                  <p className="mt-1 text-sm text-default-500">
                    {production.description}
                  </p>
                )}
              </div>

              {/* Acciones: vista previa (staff) y menú de opciones */}
              <div className="flex flex-wrap items-center gap-2">
                {canEdit && (
                  <SecondaryButton
                    startContent={<FaEye />}
                    onClick={togglePreview}
                  >
                    Ver como visitante
                  </SecondaryButton>
                )}
                {blogOptions.length > 0 && (
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        radius="full"
                        isIconOnly={!canEdit}
                        aria-label="Opciones del blog"
                        startContent={canEdit ? <FaCog /> : undefined}
                      >
                        {canEdit ? "Opciones" : <FaEllipsisH />}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Opciones del blog"
                      items={blogOptions}
                      onAction={(key) =>
                        blogOptions
                          .find((option) => option.key === key)
                          ?.onAction()
                      }
                    >
                      {(option) => (
                        <DropdownItem
                          key={option.key}
                          startContent={option.icon}
                          description={option.description}
                          color={option.danger ? "danger" : "default"}
                          className={option.danger ? "text-danger" : ""}
                          showDivider={option.divider}
                        >
                          {option.label}
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                )}
              </div>
            </div>

            {/* Fans: siempre a la vista, junto al título del blog */}
            <div className="mt-3">
              <FanButton
                onBlocked={previewBlocked}
                productionId={production._id}
                isFan={production.viewer?.isFan ?? false}
                fansCount={production.fansCount}
                onChanged={reloadBlog}
                readOnly={
                  production.viewer?.role === "admin" && !previewMode
                }
              />
            </div>

            {/* Texto de bienvenida */}
            {production.welcomeText && (
              <p className="mt-3 border-l-2 border-primary/40 pl-3 text-sm italic text-default-500">
                {production.welcomeText}
              </p>
            )}

            {/* Puntaje del blog y botón para reseñar. El staff (dueño o
                moderador) no reseña su propio blog. */}
            <div className="mt-auto flex flex-col gap-3 pt-4">
              <ProductionRating
                onBlocked={previewBlocked}
                productionId={production._id}
                rating={production.rating}
                reviewsCount={production.reviewsCount}
                canReview={!isStaffViewer || previewMode}
                onReviewed={() => {
                  setCommunityVersion((version) => version + 1);
                  reloadBlog();
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navegación del árbol (flechas + breadcrumb) y acciones de creación */}
      <div className="flex items-center justify-between gap-4 flex-wrap rounded-xl border border-default-200 bg-content1 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            radius="full"
            aria-label="Atrás"
            title="Atrás"
            isDisabled={!canGoBack || loading}
            onPress={() => stepHistory(-1)}
          >
            <FaArrowLeft />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            radius="full"
            aria-label="Adelante"
            title="Adelante"
            isDisabled={!canGoForward || loading}
            onPress={() => stepHistory(1)}
          >
            <FaArrowRight />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            radius="full"
            aria-label="Subir un nivel"
            title="Subir un nivel"
            isDisabled={!currentParentId || loading}
            onPress={() => openLevel(parentOfCurrent)}
          >
            <FaArrowUp />
          </Button>
          <Breadcrumbs className="ml-2 min-w-0">
            <BreadcrumbItem
              onPress={() => openLevel(undefined)}
              isCurrent={!currentParentId}
            >
              Inicio
            </BreadcrumbItem>
            {data.breadcrumb.map((crumb, index) => (
              <BreadcrumbItem
                key={crumb._id}
                onPress={() => openLevel(crumb._id)}
                isCurrent={index === data.breadcrumb.length - 1}
              >
                {crumb.name}
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>
          {/* Link directo al nivel abierto (blog o carpeta). */}
          <ShareLinkButton
            iconOnly
            path={productionFolderPath(production._id, currentParentId)}
            title={data.breadcrumb.at(-1)?.name ?? production.title}
            label={
              currentParentId ? "Compartir esta carpeta" : "Compartir el blog"
            }
          />
        </div>
        {canEdit && (
          <ProductionStaffToolbar
            productionId={production._id}
            parentId={currentParentId}
            onCreated={refreshLevel}
            uploadFiles={uploadFiles}
            uploadProgress={uploadProgress}
          />
        )}
      </div>

      {/* Búsqueda, filtros y tipo de vista del nivel */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          size="sm"
          radius="full"
          isClearable
          aria-label="Buscar en esta carpeta"
          placeholder="Buscar en esta carpeta"
          startContent={<FaSearch className="text-default-400" />}
          value={search}
          onValueChange={setSearch}
          className="w-full sm:max-w-xs"
        />
        <Select
          size="sm"
          radius="full"
          aria-label="Filtrar por tipo"
          disallowEmptySelection
          selectedKeys={[typeFilter]}
          onSelectionChange={(keys) =>
            setTypeFilter(
              (Array.from(keys)[0] as ProductionTypeFilter) ?? "all",
            )
          }
          className="w-[calc(50%-0.25rem)] sm:w-44"
        >
          {PRODUCTION_TYPE_FILTERS.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
        <Select
          size="sm"
          radius="full"
          aria-label="Ordenar"
          disallowEmptySelection
          selectedKeys={[sort]}
          onSelectionChange={(keys) =>
            setSort((Array.from(keys)[0] as ProductionSort) ?? "recent")
          }
          className="w-[calc(50%-0.25rem)] sm:w-44"
        >
          {PRODUCTION_SORTS.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
        {viewMode === "grid" && (
          <Slider
            size="sm"
            aria-label="Tamaño de los íconos"
            minValue={ICON_SIZE.min}
            maxValue={ICON_SIZE.max}
            step={ICON_SIZE.step}
            value={iconSize}
            onChange={(value) =>
              changeIconSize(Array.isArray(value) ? value[0] : value)
            }
            startContent={
              <FaThLarge className="text-xs text-default-400" aria-hidden />
            }
            endContent={
              <FaThLarge className="text-lg text-default-400" aria-hidden />
            }
            className="w-full sm:ml-auto sm:w-48"
          />
        )}
        <ButtonGroup
          size="sm"
          radius="full"
          className={viewMode === "grid" ? "" : "sm:ml-auto"}
        >
          <Button
            isIconOnly
            aria-label="Ver como grilla"
            title="Grilla"
            variant={viewMode === "grid" ? "solid" : "flat"}
            color={viewMode === "grid" ? "primary" : "default"}
            onPress={() => changeViewMode("grid")}
          >
            <FaThLarge />
          </Button>
          <Button
            isIconOnly
            aria-label="Ver como lista"
            title="Lista"
            variant={viewMode === "list" ? "solid" : "flat"}
            color={viewMode === "list" ? "primary" : "default"}
            onPress={() => changeViewMode("list")}
          >
            <FaList />
          </Button>
        </ButtonGroup>
      </div>

      {/* Selección múltiple (staff) */}
      {canEdit && selectedItems.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-2.5">
          <p className="text-sm font-medium">
            {plural(
              selectedItems.length,
              "elemento seleccionado",
              "elementos seleccionados",
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="light"
              onPress={() =>
                setSelectedIds(new Set(visibleItems.map((item) => item._id)))
              }
            >
              Seleccionar todo
            </Button>
            <Button
              size="sm"
              variant="light"
              onPress={() => setSelectedIds(new Set())}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              color="secondary"
              radius="full"
              startContent={<FaFolderOpen />}
              onPress={() => openMoveModal(selectedItems)}
            >
              Mover
            </Button>
          </div>
        </div>
      )}

      {/* Aviso de ticket del nivel (visitante sin acceso) */}
      {!loading && levelTicket && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <FaLock className="mt-1 text-warning-600" />
            <div>
              <p className="text-sm font-medium">
                {levelTicketIsBlog
                  ? "Este blog requiere ticket"
                  : "Esta carpeta requiere ticket"}
              </p>
              <p className="text-xs text-default-600">
                {levelTicketIsBlog
                  ? blogContentSummary(
                      rootFilesCount,
                      production.foldersCount ?? 0,
                      Math.max(0, production.filesCount - rootFilesCount),
                    )
                  : `Esta carpeta tiene ${plural(
                      inheritedLocked.length - lockedFolders,
                      "archivo",
                      "archivos",
                    )}${
                      lockedFolders > 0
                        ? ` y ${plural(lockedFolders, "carpeta", "carpetas")}`
                        : ""
                    }.`}{" "}
                {levelTicket.isPaid
                  ? "Comprá el ticket para acceder a todo el contenido."
                  : "Obtené el ticket gratuito para acceder a todo el contenido."}
              </p>
            </div>
          </div>
          <PrimaryButton
            startContent={<FaShoppingCart />}
            onClick={levelCheckout.onOpen}
          >
            {levelTicket.isPaid
              ? `Comprar (${levelTicket.currency} ${levelTicket.price})`
              : "Obtener acceso"}
          </PrimaryButton>
        </div>
      )}

      {/* Nivel actual. Para el staff es también zona de subida: se pueden
          soltar archivos del escritorio acá o sobre una carpeta. */}
      <div
        className={`relative rounded-xl transition-shadow ${
          fileDropActive ? "ring-2 ring-primary ring-offset-4" : ""
        }`}
        onDragEnter={(event) => {
          if (!canEdit || !isFileDrag(event)) return;
          event.preventDefault();
          fileDragDepth.current++;
          setFileDropActive(true);
        }}
        onDragOver={(event) => {
          if (!canEdit || !isFileDrag(event)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={() => {
          if (fileDragDepth.current > 0) fileDragDepth.current--;
          if (fileDragDepth.current === 0) setFileDropActive(false);
        }}
        onDrop={(event) => {
          if (!canEdit || !isFileDrag(event)) return;
          event.preventDefault();
          handleDrop(currentParentId, event);
        }}
      >
        {fileDropActive && (
          <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center">
            <span className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg">
              <FaUpload />
              Soltá los archivos para subirlos acá, o sobre una carpeta
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : data.items.length === 0 ? (
          <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-default-200 py-12 text-center">
            <span className="text-3xl">📂</span>
            <p className="text-sm font-medium text-default-600">
              Esta carpeta está vacía.
            </p>
            {canEdit && (
              <p className="text-xs text-default-400">
                Creá una carpeta, escribí un artículo o arrastrá archivos acá
                para empezar.
              </p>
            )}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-default-200 py-12 text-center">
            <p className="text-sm font-medium text-default-600">
              Ningún elemento coincide con la búsqueda.
            </p>
            {hasFilters && (
              <Button
                size="sm"
                variant="flat"
                onPress={() => {
                  setSearch("");
                  setTypeFilter("all");
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "list"
                ? "flex flex-col gap-2"
                : "grid gap-3 md:gap-4 items-start"
            }
            style={
              viewMode === "grid"
                ? {
                    // En pantallas angostas nunca menos de dos columnas.
                    gridTemplateColumns: `repeat(auto-fill, minmax(min(${iconSize}px, 45%), 1fr))`,
                  }
                : undefined
            }
          >
            {visibleItems.map((item) => (
              <ProductionItemCard
                key={item._id}
                item={item}
                layout={viewMode}
                compact={iconSize < ICON_SIZE.compact}
                onOpen={handleOpen}
                canEdit={canEdit}
                canManageAccess={canManageAccess}
                onItemChanged={refreshLevel}
                aliasCbu={production.aliasCbu}
                canManagePayout={production.viewer?.canManagePayout}
                commissionPercent={production.ticketCommissionPercent}
                hideCheckout={
                  !!levelTicket && item.access?.ticket?._id === levelTicket._id
                }
                selected={selectedIds.has(item._id)}
                onToggleSelect={canEdit ? toggleSelect : undefined}
                onMove={(target) => openMoveModal([target])}
                onDragStartItem={canEdit ? handleDragStartItem : undefined}
                onDragEndItem={endDrag}
                // Una carpeta no se suelta sobre sí misma.
                canDropOnFolder={(folder) =>
                  !draggingIds.current.includes(folder._id)
                }
                onDropOnFolder={
                  canEdit
                    ? (folder, event) => handleDrop(folder._id, event)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Mientras se arrastra un ítem dentro de una carpeta: destinos para
          sacarlo hacia arriba (la raíz o una carpeta anterior del camino). */}
      {canEdit && internalDrag && currentParentId && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl border border-default-200 bg-content1/95 px-4 py-3 shadow-xl backdrop-blur">
            <span className="text-xs text-default-500">Mover a:</span>
            <DropChip
              label="Inicio"
              onDrop={(event) => handleDrop(undefined, event)}
            />
            {data.breadcrumb.slice(0, -1).map((crumb) => (
              <DropChip
                key={crumb._id}
                label={crumb.name}
                onDrop={(event) => handleDrop(crumb._id, event)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reseñas y comentarios. El staff responde y modera comentarios; las
          reseñas se escriben desde el encabezado. */}
      <ProductionCommunity
        key={communityVersion}
        productionId={production._id}
        isStaff={canEdit}
        onBlocked={previewBlocked}
      />

      {/* Mover la selección (o un ítem) a otra carpeta (staff) */}
      {canEdit && (
        <MoveItemsModal
          productionId={production._id}
          items={itemsToMove}
          currentParentId={currentParentId}
          isOpen={moveModal.isOpen}
          onOpenChange={moveModal.onOpenChange}
          onMoved={refreshLevel}
        />
      )}

      {/* Confirmación del borrado del blog: hay que escribir su nombre */}
      {production.viewer?.canDelete && (
        <DeleteBlogModal
          title={production.title}
          isOpen={deleteBlogModal.isOpen}
          onOpenChange={deleteBlogModal.onOpenChange}
          onConfirm={handleDeleteBlog}
        />
      )}

      {/* Mapa del blog: qué es gratis y qué va con ticket (staff) */}
      {canManageAccess && (
        <ProductionMapModal
          productionId={production._id}
          productionTitle={production.title}
          isOpen={mapModal.isOpen}
          onOpenChange={mapModal.onOpenChange}
          onChanged={reloadBlog}
          aliasCbu={production.aliasCbu}
          canManagePayout={production.viewer?.canManagePayout}
          commissionPercent={production.ticketCommissionPercent}
        />
      )}

      {/* Denuncias que recibió el blog, sin el denunciante (staff) */}
      {canManageAccess && (
        <ReceivedReportsModal
          productionId={production._id}
          productionTitle={production.title}
          isOpen={receivedReportsModal.isOpen}
          onOpenChange={receivedReportsModal.onOpenChange}
        />
      )}

      {/* Denuncia del blog */}
      <ReportModal
        productionId={production._id}
        targetLabel={`Blog «${production.title}»`}
        ownerName={ownerName}
        isOpen={reportModal.isOpen}
        onOpenChange={reportModal.onOpenChange}
      />

      {/* Modal de ingreso de clave (visitante) */}
      <AccessKeyModal
        productionId={production._id}
        isOpen={accessKeyModal.isOpen}
        onOpenChange={accessKeyModal.onOpenChange}
        onUnlocked={() => {
          accessKeyModal.onClose();
          reloadBlog();
        }}
      />

      {/* Config de alcance y clave (staff) */}
      {canManageAccess && (
        <ProductionAccessSettings
          production={production}
          isOpen={accessSettings.isOpen}
          onOpenChange={accessSettings.onOpenChange}
          onChanged={reloadBlog}
          onOpenTicket={() => {
            accessSettings.onClose();
            blogTicketModal.onOpen();
          }}
        />
      )}

      {/* Compra del ticket heredado del nivel (visitante) */}
      {levelTicket && (
        <TicketCheckoutModal
          ticketId={levelTicket._id}
          isOpen={levelCheckout.isOpen}
          onOpenChange={levelCheckout.onOpenChange}
          onPurchased={() => {
            levelCheckout.onClose();
            reloadBlog();
          }}
        />
      )}

      {/* Ventas de tickets de todo el blog (staff) */}
      {canManageAccess && (
        <TicketSalesModal
          productionId={production._id}
          isOpen={salesModal.isOpen}
          onOpenChange={salesModal.onOpenChange}
        />
      )}

      {/* Ticket de todo el blog (staff) */}
      {canManageAccess && (
        <TicketManagerModal
          productionId={production._id}
          targetName={production.title}
          isOpen={blogTicketModal.isOpen}
          onOpenChange={blogTicketModal.onOpenChange}
          onChanged={reloadBlog}
          aliasCbu={production.aliasCbu}
          canManagePayout={production.viewer?.canManagePayout}
          commissionPercent={production.ticketCommissionPercent}
          hasContent={production.filesCount > 0}
        />
      )}
    </div>
  );
};

export default ProductionBlog;
