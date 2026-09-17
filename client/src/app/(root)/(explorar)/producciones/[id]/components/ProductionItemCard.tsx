"use client";
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react";
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

interface Props {
  item: ProductionItemResponse;
  onOpen: (item: ProductionItemResponse) => void;
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
        className="w-full h-48"
        shadow="sm"
      >
        <CardBody className="flex items-center justify-center overflow-hidden p-0">
          {renderPreview(item, locked)}
        </CardBody>
        <CardFooter className="flex-col items-start gap-0.5">
          <span className="text-sm font-medium truncate w-full">
            {item.name}
          </span>
          {item.fileName && (
            <span className="text-xs text-default-500 truncate w-full">
              {item.fileName}
            </span>
          )}
        </CardFooter>
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

const renderPreview = (item: ProductionItemResponse, locked: boolean) => {
  if (item.kind === ProductionItemKind.folder) {
    return <FaFolder className="text-5xl text-warning" />;
  }

  if (locked) {
    return <FaLock className="text-4xl text-default-400" />;
  }

  if (item.kind === ProductionItemKind.article) {
    return <FaFileAlt className="text-5xl text-primary" />;
  }

  // file
  switch (item.fileType) {
    case ProductionFileType.photo:
      return (
        <Image
          removeWrapper
          alt={item.name}
          src={resolveProductionFileUrl(item.key)}
          className="w-full h-full object-cover"
        />
      );
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

export default ProductionItemCard;
