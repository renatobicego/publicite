"use client";
import { Image } from "@nextui-org/react";
import { FaLock } from "react-icons/fa";
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
  if (!item.access?.canViewContent) {
    return (
      <div className="w-full flex flex-col items-center gap-3 py-16">
        <FaLock className="text-4xl text-default-400" />
        <p className="text-sm text-center">
          {lockMessage[item.access?.lockReason ?? ""] ??
            "Este contenido no está disponible."}
        </p>
      </div>
    );
  }

  if (item.kind === ProductionItemKind.article) {
    const output = deserializeBlocks(item.blocks);
    return (
      <article className="w-full max-w-3xl flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h2>{item.name}</h2>
          {canEdit && <ProductionItemDetailActions item={item} />}
        </div>
        <BlockRenderer data={output} />
      </article>
    );
  }

  return (
    <div className="w-full max-w-3xl flex flex-col gap-3">
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
          className="w-full rounded-lg"
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
