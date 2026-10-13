"use client";
import { Image, useDisclosure } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  FaDownload,
  FaFileAlt,
  FaLock,
  FaShoppingCart,
} from "react-icons/fa";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import TicketCheckoutModal from "../../../components/TicketCheckoutModal";
import {
  ProductionFileType,
  ProductionItemKind,
  ProductionItemResponse,
  ProductionLockReason,
} from "@/types/productionTypes";
import { resolveProductionFileUrl } from "../../../../productionMedia";
import { deserializeBlocks } from "@/components/BlockEditor/blockEditorFormat";
import BlockRenderer from "@/components/BlockEditor/BlockRenderer";
import AudioPlayer from "@/components/MediaPlayers/AudioPlayer";
import VideoPlayer from "@/components/MediaPlayers/VideoPlayer";
import ProductionItemDetailActions from "./ProductionItemDetailActions";

const lockMessage: Record<string, string> = {
  [ProductionLockReason.ticket]:
    "Este contenido requiere un ticket para verse.",
  [ProductionLockReason.accessKey]:
    "Este contenido requiere la clave del blog.",
  [ProductionLockReason.pendingReview]:
    "Tenés una reseña pendiente que bloquea el acceso.",
};

/** Detalle de un archivo (postal, video, escrito, audio) o artículo. */
const ProductionItemDetail = ({
  item,
  canEdit,
}: {
  item: ProductionItemResponse;
  canEdit?: boolean;
}) => {
  const router = useRouter();
  const checkout = useDisclosure();

  if (!item.access?.canViewContent) {
    const ticket =
      item.access?.lockReason === ProductionLockReason.ticket
        ? item.access.ticket
        : null;
    return (
      <div className="w-full flex flex-col items-center gap-3 py-16">
        <FaLock className="text-4xl text-default-400" />
        <h2 className="text-center">{item.name}</h2>
        <p className="text-sm text-center">
          {lockMessage[item.access?.lockReason ?? ""] ??
            "Este contenido no está disponible."}
        </p>
        {ticket && (
          <>
            <PrimaryButton
              startContent={<FaShoppingCart />}
              onClick={checkout.onOpen}
            >
              {ticket.isPaid
                ? `Comprar (${ticket.currency} ${ticket.price})`
                : "Obtener acceso"}
            </PrimaryButton>
            <TicketCheckoutModal
              ticketId={ticket._id}
              isOpen={checkout.isOpen}
              onOpenChange={checkout.onOpenChange}
              onPurchased={() => {
                checkout.onClose();
                router.refresh();
              }}
            />
          </>
        )}
      </div>
    );
  }

  if (item.kind === ProductionItemKind.article) {
    const output = deserializeBlocks(item.blocks);
    return (
      // Tarjeta que engloba el artículo: encabezado con el título y cuerpo con
      // el contenido, igual que el resto de los recuadros del blog.
      <article className="mx-auto w-full max-w-screen-lg overflow-hidden rounded-2xl border border-default-200 bg-content1 shadow-md">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-default-200 bg-default-50 px-4 py-4 sm:px-8 sm:py-5">
          <h2 className="min-w-0 break-words">{item.name}</h2>
          {canEdit && <ProductionItemDetailActions item={item} />}
        </header>
        <div className="px-4 py-5 sm:px-8 sm:py-8">
          <BlockRenderer data={output} />
        </div>
      </article>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h2>{item.name}</h2>
        {canEdit && <ProductionItemDetailActions item={item} />}
      </div>
      {renderFile(item)}
      {item.postcard && renderPostcard(item.postcard)}
    </div>
  );
};

const renderFile = (item: ProductionItemResponse) => {
  switch (item.fileType) {
    case ProductionFileType.photo:
      return (
        <Image
          alt={item.name}
          src={resolveProductionFileUrl(item.key)}
          classNames={{ wrapper: "mx-auto !max-w-full" }}
          className="max-h-[85vh] w-auto max-w-full rounded-sm object-contain"
        />
      );
    case ProductionFileType.video:
      return (
        <VideoPlayer src={resolveProductionFileUrl(item.key, true)} />
      );
    case ProductionFileType.audio:
      return (
        <AudioPlayer
          src={resolveProductionFileUrl(item.key)}
          title={item.name}
        />
      );
    case ProductionFileType.writing:
      return (
        <iframe
          title={item.name}
          className="w-full h-[70vh] rounded-lg"
          src={resolveProductionFileUrl(item.key)}
        />
      );
    case ProductionFileType.document:
      // El navegador no muestra archivos de Office: se ofrecen para descargar.
      return (
        <div className="flex flex-col items-center gap-4 rounded-lg border p-8">
          <FaFileAlt className="text-5xl text-default-500" />
          <p className="text-sm text-center break-all">{item.name}</p>
          <a
            href={resolveProductionFileUrl(item.key)}
            target="_blank"
            rel="noopener noreferrer"
            download={item.name}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-[10px] text-sm font-medium text-white hover:opacity-80"
          >
            <FaDownload />
            Descargar
          </a>
        </div>
      );
    default:
      return null;
  }
};

const renderPostcard = (
  postcard: NonNullable<ProductionItemResponse["postcard"]>
) => (
  <div className="rounded-lg border p-4 text-sm flex flex-col gap-1">
    {postcard.authorship && (
      <p>
        <span className="font-medium">Autoría:</span> {postcard.authorship}
      </p>
    )}
    {postcard.dedication && (
      <p>
        <span className="font-medium">Dedicatoria:</span> {postcard.dedication}
      </p>
    )}
    {postcard.description && (
      <p>
        <span className="font-medium">Descripción:</span>{" "}
        {postcard.description}
      </p>
    )}
    {(postcard.latitude != null || postcard.longitude != null) && (
      <p>
        <span className="font-medium">Coordenadas:</span> {postcard.latitude},{" "}
        {postcard.longitude}
      </p>
    )}
  </div>
);

export default ProductionItemDetail;
