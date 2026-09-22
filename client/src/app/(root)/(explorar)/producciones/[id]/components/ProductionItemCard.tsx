"use client";
import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";
import { useState } from "react";
import { Button, useDisclosure } from "@nextui-org/react";
import {
  FaFolder,
  FaLock,
  FaFileAlt,
  FaMusic,
  FaVideo,
  FaTicketAlt,
  FaShoppingCart,
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
import ProductionItemActions from "./ProductionItemActions";

interface Props {
  item: ProductionItemResponse;
  onOpen: (item: ProductionItemResponse) => void;
  /** Staff: puede renombrar/editar/borrar el ítem. */
  canEdit?: boolean;
  /** Staff: muestra el control de alcance por ítem. */
  canManageAccess?: boolean;
  onItemChanged?: () => void;
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
}: Props) => {
  const locked = !item.access?.canViewContent;
  const lockedByTicket =
    locked && item.access?.lockReason === ProductionLockReason.ticket;
  const checkout = useDisclosure();
  const ticketManager = useDisclosure();

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
      {lockedByTicket && item.access?.ticket && (
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
        </>
      )}

      {lockedByTicket && item.access?.ticket && (
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
        <TicketManagerModal
          productionId={item.production}
          targetId={item._id}
          targetName={item.name}
          isOpen={ticketManager.isOpen}
          onOpenChange={ticketManager.onOpenChange}
          onChanged={onItemChanged}
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

const renderPreview = (item: ProductionItemResponse, locked: boolean) => {
  if (item.kind === ProductionItemKind.folder) {
    return (
      <IconBox>
        <FaFolder className="text-5xl text-warning" />
      </IconBox>
    );
  }

  if (locked) {
    return (
      <IconBox>
        <FaLock className="text-4xl text-default-400" />
      </IconBox>
    );
  }

  if (item.kind === ProductionItemKind.article) {
    return (
      <IconBox>
        <FaFileAlt className="text-5xl text-primary" />
      </IconBox>
    );
  }

  // file
  switch (item.fileType) {
    case ProductionFileType.photo:
      return (
        <Image
          src={resolveProductionFileUrl(item.key)}
          classNames={{
            wrapper: "!max-w-full w-full max-md:max-h-[45vw] md:max-lg:max-h-[25vw]",
            img: "!max-w-full w-full object-cover max-md:max-h-[45vw] md:max-h-[25vw] lg:max-h-[22vw] xl:max-h-[17vw] 3xl:max-h-[14vw]",
          }}
          alt={item.name}
          width={287}
          height={290}
        />
      );
    case ProductionFileType.video:
      return (
        <IconBox>
          <FaVideo className="text-5xl text-secondary" />
        </IconBox>
      );
    case ProductionFileType.audio:
      return (
        <IconBox>
          <FaMusic className="text-5xl text-success" />
        </IconBox>
      );
    case ProductionFileType.writing:
      return (
        <IconBox>
          <FaFileAlt className="text-5xl text-default-600" />
        </IconBox>
      );
    default:
      return (
        <IconBox>
          <FaFileAlt className="text-5xl text-default-400" />
        </IconBox>
      );
  }
};

export default ProductionItemCard;
