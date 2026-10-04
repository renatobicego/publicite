"use client";
import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";
import { useState } from "react";
import { Button, useDisclosure } from "@nextui-org/react";
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
} from "react-icons/fa";
import {
  ProductionFileType,
  ProductionItemKind,
  ProductionItemResponse,
  ProductionLockReason,
} from "@/types/productionTypes";
import { resolveProductionFileUrl } from "../../productionMedia";
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
}

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
}: Props) => {
  const locked = !item.access?.canViewContent;
  const lockedByTicket =
    locked && item.access?.lockReason === ProductionLockReason.ticket;
  const checkout = useDisclosure();
  const ticketManager = useDisclosure();
  const sales = useDisclosure();

  return (
    <div className="flex flex-col gap-1">
      <Card
        isPressable
        onPress={() => onOpen(item)}
        shadow="none"
        className="w-full gap-4 ease-in-out hover:shadow md:hover:shadow-md !transition-shadow duration-500 !opacity-100"
      >
        <CardHeader className="relative w-full pb-0 max-md:px-1 md:px-2 lg:px-3">
          {renderPreview(item, locked)}
          {canEdit && onItemChanged && (
            <div
              className="absolute top-2 right-2 md:right-4 z-10"
              // Evita que el click en las acciones dispare la navegación de la card.
              onClick={(e) => e.stopPropagation()}
            >
              <ProductionItemActions item={item} onChanged={onItemChanged} />
            </div>
          )}
        </CardHeader>
        <CardBody className="pt-0 flex flex-col gap-1 max-md:px-1 md:px-2 lg:px-3 pb-6">
          <h6 className="line-clamp-1">{item.name}</h6>
          {item.fileName && (
            <p className="text-light-text text-xs lg:text-small 2xl:text-sm line-clamp-1">
              {item.fileName}
            </p>
          )}
        </CardBody>
      </Card>

      {/* Visitante: comprar acceso si el ítem está bloqueado por ticket */}
      {lockedByTicket && item.access?.ticket && !hideCheckout && (
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
      )}

      {/* Staff: alcance + gestión del ticket */}
      {canManageAccess && onItemChanged && (
        <>
          <ItemVisibilityControl item={item} onChanged={onItemChanged} />
          <Button
            size="sm"
            variant="flat"
            startContent={<FaTicketAlt />}
            className="text-xs"
            onPress={ticketManager.onOpen}
          >
            Ticket
          </Button>
          <Button
            size="sm"
            variant="flat"
            startContent={<FaReceipt />}
            className="text-xs"
            onPress={sales.onOpen}
          >
            Ventas
          </Button>
        </>
      )}

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

const kindIcon = (item: ProductionItemResponse) => {
  if (item.kind === ProductionItemKind.article) {
    return <FaFileAlt className="text-5xl text-primary" />;
  }
  switch (item.fileType) {
    case ProductionFileType.photo:
      return <FaImage className="text-5xl text-primary" />;
    case ProductionFileType.video:
      return <FaVideo className="text-5xl text-secondary" />;
    case ProductionFileType.audio:
      return <FaMusic className="text-5xl text-success" />;
    case ProductionFileType.writing:
      return <FaFileAlt className="text-5xl text-default-600" />;
    default:
      return <FaFileAlt className="text-5xl text-default-400" />;
  }
};

const renderPreview = (item: ProductionItemResponse, locked: boolean) => {
  if (item.kind === ProductionItemKind.folder) {
    return (
      <div className={`${previewBox} relative`}>
        <FaFolder className="text-5xl text-warning" />
        {locked && (
          <span className="absolute bottom-2 right-2 rounded-full bg-content1/90 p-2 shadow">
            <FaLock className="text-sm text-default-600" />
          </span>
        )}
      </div>
    );
  }

  if (locked) {
    return <LockedBox>{kindIcon(item)}</LockedBox>;
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

  return <IconBox>{kindIcon(item)}</IconBox>;
};

export default ProductionItemCard;
