"use client";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Image,
  useDisclosure,
} from "@nextui-org/react";
import { useRef, useState } from "react";
import {
  FaFolder,
  FaLock,
  FaFileAlt,
  FaImage,
  FaMusic,
  FaVideo,
  FaTicketAlt,
  FaShoppingCart,
  FaReceipt,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaUserLock,
} from "react-icons/fa";
import {
  ProductionFileType,
  ProductionFolderPreviewItem,
  ProductionItemKind,
  ProductionItemResponse,
  ProductionLockReason,
} from "@/types/productionTypes";
import { resolveProductionFileUrl } from "../../productionMedia";
import { documentFamilyOf } from "../../productionFiles";
import {
  isFileDrag,
  isItemsDrag,
  itemTypeLabel,
  ProductionViewMode,
} from "../../productionBrowse";
import { isOnlyMe } from "../../productionVisibility";
import ItemVisibilityControl from "./ItemVisibilityControl";
import TicketCheckoutModal from "./TicketCheckoutModal";
import TicketManagerModal from "./TicketManagerModal";
import TicketSalesModal from "./TicketSalesModal";
import ProductionItemActions from "./ProductionItemActions";

interface Props {
  item: ProductionItemResponse;
  onOpen: (item: ProductionItemResponse) => void;
  /** Staff: puede renombrar/editar/borrar el ítem. */
  canEdit?: boolean;
  /** Staff: muestra el control de alcance por ítem. */
  canManageAccess?: boolean;
  onItemChanged?: () => void;
  aliasCbu?: string | null;
  canManagePayout?: boolean;
  /** Comisión de Soonpublicité sobre tickets pagos (0-100). */
  commissionPercent?: number | null;
  /** La compra se ofrece en el aviso del nivel (ticket heredado). */
  hideCheckout?: boolean;
  /** Tarjeta (grilla) o fila (lista). */
  layout?: ProductionViewMode;
  /** Grilla con íconos chicos: los controles de staff van sólo con ícono. */
  compact?: boolean;
  /** Staff: selección múltiple para mover. */
  selected?: boolean;
  onToggleSelect?: (item: ProductionItemResponse) => void;
  /** Staff: abre el selector de carpeta de destino para este ítem. */
  onMove?: (item: ProductionItemResponse) => void;
  /** Staff: empieza a arrastrar el ítem (para soltarlo en una carpeta). */
  onDragStartItem?: (item: ProductionItemResponse, event: React.DragEvent) => void;
  onDragEndItem?: () => void;
  /**
   * Staff, sólo carpetas: soltaron algo encima (ítems del blog o archivos del
   * escritorio). Si devuelve `false` para un arrastre, la carpeta no lo acepta.
   */
  canDropOnFolder?: (folder: ProductionItemResponse) => boolean;
  onDropOnFolder?: (folder: ProductionItemResponse, event: React.DragEvent) => void;
}

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

/**
 * Tarjeta de un ítem del árbol. Representa carpeta, foto (postal), video,
 * escrito, audio o artículo. Si el contenido está bloqueado muestra el candado.
 */
const ProductionItemCard = ({
  item,
  onOpen,
  canEdit,
  canManageAccess,
  onItemChanged,
  aliasCbu,
  canManagePayout,
  commissionPercent,
  hideCheckout,
  layout = "grid",
  compact = false,
  selected = false,
  onToggleSelect,
  onMove,
  onDragStartItem,
  onDragEndItem,
  canDropOnFolder,
  onDropOnFolder,
}: Props) => {
  const locked = !item.access?.canViewContent;
  // "Sólo yo" (propio o heredado): sólo le llega al staff, que lo ve marcado.
  const privateBadge = isOnlyMe(item.effectiveVisibility) && (
    <FaUserLock
      className="shrink-0 text-secondary"
      title="Sólo yo: nadie más lo ve"
      aria-label="Sólo yo"
    />
  );
  const lockedByTicket =
    locked && item.access?.lockReason === ProductionLockReason.ticket;
  const checkout = useDisclosure();
  const ticketManager = useDisclosure();
  const sales = useDisclosure();

  // Carpeta como destino de un arrastre. `dragenter`/`dragleave` se disparan
  // también al pasar por los hijos, por eso se cuenta la profundidad.
  const isFolder = item.kind === ProductionItemKind.folder;
  const [dropActive, setDropActive] = useState(false);
  const dragDepth = useRef(0);
  const acceptsDrop = (event: React.DragEvent) =>
    isFolder &&
    !!onDropOnFolder &&
    (isFileDrag(event) || isItemsDrag(event)) &&
    (canDropOnFolder?.(item) ?? true);

  // El arrastre arranca desde el elemento presionable: react-aria sólo deja
  // pasar el `dragstart` si ese mismo elemento es `draggable`.
  const dragSourceProps = onDragStartItem
    ? {
        draggable: true,
        onDragStart: (event: React.DragEvent) => onDragStartItem(item, event),
        onDragEnd: () => onDragEndItem?.(),
      }
    : {};

  const dropProps = {
    onDragEnter: (event: React.DragEvent) => {
      if (!acceptsDrop(event)) return;
      event.preventDefault();
      dragDepth.current++;
      setDropActive(true);
    },
    onDragOver: (event: React.DragEvent) => {
      if (!acceptsDrop(event)) return;
      event.preventDefault();
      // Que no lo tome también la zona de subida del nivel.
      event.stopPropagation();
      event.dataTransfer.dropEffect = isItemsDrag(event) ? "move" : "copy";
    },
    onDragLeave: () => {
      if (dragDepth.current > 0) dragDepth.current--;
      if (dragDepth.current === 0) setDropActive(false);
    },
    onDrop: (event: React.DragEvent) => {
      dragDepth.current = 0;
      setDropActive(false);
      if (!acceptsDrop(event)) return;
      event.preventDefault();
      event.stopPropagation();
      onDropOnFolder?.(item, event);
    },
  };

  const dropRing = dropActive
    ? "ring-2 ring-primary ring-offset-2 rounded-large bg-primary/5"
    : "";
  const selectedRing = selected ? "ring-2 ring-secondary rounded-large" : "";

  const checkoutButton = lockedByTicket &&
    item.access?.ticket &&
    !hideCheckout && (
      <Button
        size="sm"
        color="warning"
        variant="flat"
        startContent={<FaShoppingCart />}
        className="text-xs"
        onPress={checkout.onOpen}
      >
        {item.access.ticket.isPaid
          ? `Comprar (${item.access.ticket.currency} ${item.access.ticket.price})`
          : "Obtener acceso"}
      </Button>
    );

  // Staff: alcance + gestión del ticket.
  const iconOnly = compact && layout === "grid";
  const staffControls = canManageAccess && onItemChanged && (
    <>
      <ItemVisibilityControl
        item={item}
        onChanged={onItemChanged}
        compact={iconOnly}
      />
      <Button
        size="sm"
        variant="flat"
        isIconOnly={iconOnly}
        startContent={iconOnly ? undefined : <FaTicketAlt />}
        className="text-xs"
        aria-label="Ticket"
        title="Ticket"
        onPress={ticketManager.onOpen}
      >
        {iconOnly ? <FaTicketAlt /> : "Ticket"}
      </Button>
      <Button
        size="sm"
        variant="flat"
        isIconOnly={iconOnly}
        startContent={iconOnly ? undefined : <FaReceipt />}
        className="text-xs"
        aria-label="Ventas"
        title="Ventas"
        onPress={sales.onOpen}
      >
        {iconOnly ? <FaReceipt /> : "Ventas"}
      </Button>
    </>
  );

  const selectBox = canEdit && onToggleSelect && (
    <Checkbox
      isSelected={selected}
      onValueChange={() => onToggleSelect(item)}
      aria-label={`Seleccionar ${item.name}`}
      classNames={{ wrapper: "bg-content1 mr-0" }}
    />
  );

  const itemActions = canEdit && onItemChanged && (
    <ProductionItemActions
      item={item}
      onChanged={onItemChanged}
      onMove={() => onMove?.(item)}
    />
  );

  return (
    <div
      className={
        layout === "list"
          ? `flex flex-col gap-2 rounded-xl border border-default-200 bg-content1 px-2 py-2 transition-shadow sm:px-3 ${dropRing} ${selectedRing}`
          : `flex flex-col gap-1 transition-shadow ${dropRing}`
      }
      {...dropProps}
    >
      {layout === "list" ? (
        <div className="flex items-center gap-2 sm:gap-3">
          {selectBox}
          {/* No es un <button>: Firefox no arrastra desde un botón. */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onOpen(item)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen(item);
              }
            }}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
            {...dragSourceProps}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-medium bg-default-100 text-xl">
              {renderThumb(item, locked)}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <span className="truncate">{item.name}</span>
                {privateBadge}
              </span>
              <span className="truncate text-xs text-default-500">
                {itemTypeLabel(item)}
                {item.fileName ? ` · ${item.fileName}` : ""}
              </span>
            </span>
            <span className="hidden shrink-0 text-xs text-default-500 md:block">
              {formatDate(item.createdAt)}
            </span>
          </div>
          {checkoutButton}
          {itemActions}
        </div>
      ) : (
        <div className={`relative ${selectedRing}`}>
          <Card
            as="div"
            isPressable
            onPress={() => onOpen(item)}
            shadow="none"
            {...dragSourceProps}
            className={`w-full ${compact ? "gap-2" : "gap-4"} ease-in-out hover:shadow md:hover:shadow-md !transition-shadow duration-500 !opacity-100`}
          >
            <CardHeader className="w-full pb-0 max-md:px-1 md:px-2 lg:px-3">
              {renderPreview(item, locked)}
            </CardHeader>
            <CardBody
              className={`pt-0 flex flex-col gap-1 max-md:px-1 md:px-2 lg:px-3 ${
                compact ? "pb-3" : "pb-6"
              }`}
            >
              <h6
                className={`flex items-center gap-1.5 ${compact ? "text-sm" : ""}`}
              >
                <span className="line-clamp-1">{item.name}</span>
                {privateBadge}
              </h6>
              {item.fileName && (
                <p className="text-light-text text-xs lg:text-small 2xl:text-sm line-clamp-1">
                  {item.fileName}
                </p>
              )}
            </CardBody>
          </Card>
          {/* Fuera de la Card: es presionable y no puede anidar otros controles. */}
          {selectBox && (
            <div className="absolute top-2 left-2 md:left-4 z-10">
              {selectBox}
            </div>
          )}
          {itemActions && (
            <div className="absolute top-2 right-2 md:right-4 z-10">
              {itemActions}
            </div>
          )}
        </div>
      )}

      {layout === "grid" && checkoutButton}

      {staffControls &&
        (layout === "list" || iconOnly ? (
          <div
            className={`flex flex-wrap items-center pl-1 ${
              iconOnly ? "justify-center gap-1" : "gap-2"
            }`}
          >
            {staffControls}
          </div>
        ) : (
          staffControls
        ))}

      {lockedByTicket && item.access?.ticket && !hideCheckout && (
        <TicketCheckoutModal
          ticketId={item.access.ticket._id}
          isOpen={checkout.isOpen}
          onOpenChange={checkout.onOpenChange}
          onPurchased={() => {
            checkout.onClose();
            onItemChanged?.();
          }}
        />
      )}

      {canManageAccess && onItemChanged && (
        <TicketSalesModal
          productionId={item.production}
          targetId={item._id}
          targetName={item.name}
          isOpen={sales.isOpen}
          onOpenChange={sales.onOpenChange}
        />
      )}

      {canManageAccess && onItemChanged && (
        <TicketManagerModal
          productionId={item.production}
          targetId={item._id}
          targetName={item.name}
          isOpen={ticketManager.isOpen}
          onOpenChange={ticketManager.onOpenChange}
          onChanged={onItemChanged}
          aliasCbu={aliasCbu}
          canManagePayout={canManagePayout}
          commissionPercent={commissionPercent}
          hasContent={item.kind === ProductionItemKind.file ? true : undefined}
        />
      )}
    </div>
  );
};

// Contenedor con el mismo recorte/borde que la imagen de PostCard, para que
// las carpetas/archivos/artículos se vean como las tarjetas de Anuncios.
const previewBox =
  "w-full rounded-large bg-default-100 flex items-center justify-center max-md:max-h-[45vw] md:max-h-[25vw] lg:max-h-[22vw] xl:max-h-[17vw] 3xl:max-h-[14vw] aspect-[287/290]";

const IconBox = ({ children }: { children: React.ReactNode }) => (
  <div className={previewBox}>{children}</div>
);

// Con el contenido bloqueado no llega el archivo (ni key ni bloques): se
// muestra el tipo de elemento difuminado con un candado encima.
const LockedBox = ({ children }: { children: React.ReactNode }) => (
  <div className={`${previewBox} relative overflow-hidden`}>
    <div className="blur-sm opacity-50">{children}</div>
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="rounded-full bg-content1/90 p-3 shadow">
        <FaLock className="text-xl text-default-600" />
      </span>
    </div>
  </div>
);

const documentIcons = {
  word: <FaFileWord className="text-primary" />,
  excel: <FaFileExcel className="text-success" />,
  powerpoint: <FaFilePowerpoint className="text-warning" />,
};

/**
 * Ícono del tipo de elemento. El tamaño lo hereda del contenedor, así sirve
 * tanto para la tarjeta como para las miniaturas de la vista previa de carpeta.
 */
const kindIcon = (
  item: Pick<ProductionFolderPreviewItem, "kind" | "fileType"> & {
    name?: string;
    fileName?: string | null;
  }
) => {
  if (item.kind === ProductionItemKind.folder) {
    return <FaFolder className="text-warning" />;
  }
  if (item.kind === ProductionItemKind.article) {
    return <FaFileAlt className="text-primary" />;
  }
  switch (item.fileType) {
    case ProductionFileType.photo:
      return <FaImage className="text-primary" />;
    case ProductionFileType.video:
      return <FaVideo className="text-secondary" />;
    case ProductionFileType.audio:
      return <FaMusic className="text-success" />;
    case ProductionFileType.writing:
      return <FaFilePdf className="text-danger" />;
    case ProductionFileType.document: {
      const family = documentFamilyOf(item.name, item.fileName);
      return family ? (
        documentIcons[family]
      ) : (
        <FaFileAlt className="text-default-600" />
      );
    }
    default:
      return <FaFileAlt className="text-default-400" />;
  }
};

/**
 * Vista previa de una carpeta: hasta 9 elementos de adentro. Las fotos se
 * muestran en miniatura; el resto, con el ícono de su tipo.
 */
const FolderPreview = ({ items }: { items: ProductionFolderPreviewItem[] }) => (
  <div
    className={`absolute inset-0 grid gap-1 p-2 md:gap-1.5 md:p-3 ${items.length <= 4 ? "grid-cols-2 grid-rows-2" : "grid-cols-3 grid-rows-3"
      }`}
  >
    {items.map((child) => (
      <div
        key={child._id}
        className={`flex min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-medium bg-content1 ${items.length <= 4 ? "text-3xl" : "text-xl md:text-2xl"
          }`}
      >
        {child.key ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveProductionFileUrl(child.key)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          kindIcon(child)
        )}
      </div>
    ))}
  </div>
);

/** Miniatura de la vista de lista: la foto si se puede ver, si no el ícono. */
const renderThumb = (item: ProductionItemResponse, locked: boolean) => {
  if (locked) return <FaLock className="text-default-500" />;
  if (
    item.kind === ProductionItemKind.file &&
    item.fileType === ProductionFileType.photo &&
    item.key
  ) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolveProductionFileUrl(item.key)}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />
    );
  }
  return kindIcon(item);
};

const renderPreview = (item: ProductionItemResponse, locked: boolean) => {
  if (item.kind === ProductionItemKind.folder) {
    const preview = item.folderPreview ?? [];
    return (
      <div className={`${previewBox} relative overflow-hidden`}>
        {preview.length > 0 ? (
          <>
            <FolderPreview items={preview} />
            <span className="absolute bottom-2 left-2 rounded-full bg-content1/90 p-2 shadow">
              <FaFolder className="text-sm text-warning" />
            </span>
          </>
        ) : (
          <FaFolder className="text-5xl text-warning" />
        )}
        {locked && (
          <span className="absolute bottom-2 right-2 rounded-full bg-content1/90 p-2 shadow">
            <FaLock className="text-sm text-default-600" />
          </span>
        )}
      </div>
    );
  }

  const icon = <span className="text-5xl">{kindIcon(item)}</span>;

  if (locked) {
    return <LockedBox>{icon}</LockedBox>;
  }

  if (
    item.kind !== ProductionItemKind.article &&
    item.fileType === ProductionFileType.photo
  ) {
    return (
      <Image
        src={resolveProductionFileUrl(item.key)}
        classNames={{
          wrapper:
            "!max-w-full w-full max-md:max-h-[45vw] md:max-lg:max-h-[25vw]",
          img: "!max-w-full w-full object-cover max-md:max-h-[45vw] md:max-h-[25vw] lg:max-h-[22vw] xl:max-h-[17vw] 3xl:max-h-[14vw]",
        }}
        alt={item.name}
        width={287}
        height={290}
      />
    );
  }

  return <IconBox>{icon}</IconBox>;
};

export default ProductionItemCard;
