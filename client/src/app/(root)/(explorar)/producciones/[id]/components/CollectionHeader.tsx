"use client";
import { useMemo, useState } from "react";
import { Button, Chip, useDisclosure } from "@nextui-org/react";
import { FaChartBar, FaCog, FaLock, FaPlay } from "react-icons/fa";
import {
  ProductionCollectionType,
  ProductionFileType,
  ProductionItemResponse,
  ProductionPhotoVote,
} from "@/types/productionTypes";
import { toastifyWarn } from "@/utils/functions/toastify";
import { resolveProductionFileUrl } from "../../productionMedia";
import {
  collectionMeta,
  isPhotoItem,
  itemsOfType,
  sortByNameNatural,
} from "../../productionCollections";
import CollectionSettingsModal from "./CollectionSettingsModal";
import LoveItMode from "./LoveItMode";
import LoveItResultsModal from "./LoveItResultsModal";

interface Props {
  folder: ProductionItemResponse;
  /** Elementos de la carpeta (el nivel abierto). */
  items: ProductionItemResponse[];
  canEdit: boolean;
  /** Staff del blog: ve los resultados de Love It. */
  canViewResults: boolean;
  isLoggedIn: boolean;
  /** Vista previa de visitante: las acciones avisan en vez de ejecutarse. */
  onBlocked?: () => void;
  onChanged: () => void;
  votes: Map<string, ProductionPhotoVote>;
  onVote: (itemId: string, vote: ProductionPhotoVote) => void;
  onResultsClosed?: () => void;
}

const playable = (item: ProductionItemResponse) =>
  !!item.access?.canViewContent && !!item.key;

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

/**
 * Presentación de una carpeta que es colección, arriba de su grilla. Para el
 * staff, en una carpeta común, ofrece convertirla en colección.
 */
const CollectionHeader = ({
  folder,
  items,
  canEdit,
  canViewResults,
  isLoggedIn,
  onBlocked,
  onChanged,
  votes,
  onVote,
  onResultsClosed,
}: Props) => {
  const settings = useDisclosure();
  const results = useDisclosure();
  const [loveItOpen, setLoveItOpen] = useState(false);

  const meta = collectionMeta(folder.collectionType);
  const photos = useMemo(() => items.filter(isPhotoItem), [items]);
  const visiblePhotos = useMemo(() => photos.filter(playable), [photos]);
  const videos = useMemo(
    () => sortByNameNatural(itemsOfType(items, ProductionFileType.video)),
    [items]
  );
  const audios = useMemo(
    () => sortByNameNatural(itemsOfType(items, ProductionFileType.audio)),
    [items]
  );
  const cover =
    visiblePhotos.find((photo) => photo._id === folder.coverItem) ??
    visiblePhotos[0];

  const settingsModal = canEdit && (
    <CollectionSettingsModal
      folder={folder}
      photos={visiblePhotos}
      isOpen={settings.isOpen}
      onOpenChange={settings.onOpenChange}
      onSaved={onChanged}
    />
  );

  // Carpeta común: sólo el staff ve la invitación a convertirla.
  if (!meta) {
    if (!canEdit) return null;
    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-default-300 px-4 py-2">
          <p className="text-xs text-default-500">
            ¿Esta carpeta es un álbum, una película, una serie de videos o un
            disco? Convertila en colección y se presenta como tal.
          </p>
          <Button
            size="sm"
            variant="flat"
            radius="full"
            startContent={<FaCog />}
            onPress={settings.onOpen}
          >
            Convertir en colección
          </Button>
        </div>
        {settingsModal}
      </>
    );
  }

  const openLoveIt = () => {
    if (onBlocked) return onBlocked();
    if (!isLoggedIn) {
      toastifyWarn("Iniciá sesión para votar las fotos con Love It");
      return;
    }
    if (visiblePhotos.length === 0) {
      toastifyWarn(
        photos.length > 0
          ? "Para votar necesitás acceso a las fotos de este álbum"
          : "Este álbum todavía no tiene fotos"
      );
      return;
    }
    setLoveItOpen(true);
  };

  const isAlbum = folder.collectionType === ProductionCollectionType.album;
  const loveItOn = isAlbum && !!folder.loveItEnabled;
  const votedCount = visiblePhotos.filter((photo) => votes.has(photo._id)).length;

  const summary = (() => {
    switch (folder.collectionType) {
      case ProductionCollectionType.album:
        return [
          plural(photos.length, "foto", "fotos"),
          videos.length > 0 ? plural(videos.length, "video", "videos") : null,
        ]
          .filter(Boolean)
          .join(" · ");
      case ProductionCollectionType.series:
        return plural(videos.length, "capítulo", "capítulos");
      case ProductionCollectionType.music:
        return plural(audios.length, "tema", "temas");
      default:
        return null;
    }
  })();

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {loveItOn && (
        <Button
          radius="full"
          className="bg-gradient-to-r from-pink-500 to-rose-500 font-semibold text-white shadow-md"
          startContent={<span>💖</span>}
          onPress={openLoveIt}
        >
          {votedCount > 0 && votedCount < visiblePhotos.length
            ? "Seguir con Love It"
            : "Love It"}
        </Button>
      )}
      {loveItOn && canViewResults && (
        <Button
          radius="full"
          variant="flat"
          startContent={<FaChartBar />}
          onPress={results.onOpen}
        >
          Resultados Love It
        </Button>
      )}
      {canEdit && (
        <Button
          radius="full"
          variant="bordered"
          startContent={<FaCog />}
          onPress={settings.onOpen}
        >
          Configurar
        </Button>
      )}
    </div>
  );

  const titleBlock = (
    <div className="flex min-w-0 flex-col gap-2">
      <Chip size="sm" variant="flat" className="w-fit">
        {meta.emoji} {meta.label}
        {summary ? ` · ${summary}` : ""}
      </Chip>
      <h3 className="text-xl font-semibold leading-tight sm:text-2xl">
        {folder.name}
      </h3>
      {folder.description && (
        <p className="whitespace-pre-line text-sm text-default-600">
          {folder.description}
        </p>
      )}
    </div>
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-default-200 bg-content1 shadow-sm">
      {folder.collectionType === ProductionCollectionType.movie && (
        <MoviePlayer video={videos.find(playable)} cover={cover} locked={videos.length > 0 && !videos.some(playable)} />
      )}
      {folder.collectionType === ProductionCollectionType.series && (
        <Playlist kind="video" tracks={videos} cover={cover} />
      )}

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-6">
        {folder.collectionType === ProductionCollectionType.music && (
          <div className="mx-auto aspect-square w-40 shrink-0 overflow-hidden rounded-xl bg-default-100 shadow sm:mx-0">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveProductionFileUrl(cover.key)}
                alt={folder.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl">
                🎵
              </div>
            )}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {titleBlock}
          {folder.collectionType === ProductionCollectionType.music && (
            <Playlist kind="audio" tracks={audios} />
          )}
          {actions}
          {isAlbum && !loveItOn && canEdit && (
            <p className="text-xs text-default-500">
              Activá Love It en «Configurar» para que quienes entran voten las
              fotos.
            </p>
          )}
        </div>
      </div>

      {settingsModal}
      {loveItOn && canViewResults && (
        <LoveItResultsModal
          folderId={folder._id}
          albumName={folder.name}
          isOpen={results.isOpen}
          onOpenChange={(open) => {
            results.onOpenChange();
            if (!open) onResultsClosed?.();
          }}
        />
      )}
      {loveItOpen && (
        <LoveItMode
          albumName={folder.name}
          photos={visiblePhotos}
          votes={votes}
          onVote={onVote}
          onClose={() => {
            setLoveItOpen(false);
            onResultsClosed?.();
          }}
        />
      )}
    </section>
  );
};

/** Película: el video principal grande, con el afiche mientras no arranca. */
const MoviePlayer = ({
  video,
  cover,
  locked,
}: {
  video?: ProductionItemResponse;
  cover?: ProductionItemResponse;
  locked: boolean;
}) => (
  <div className="relative aspect-video w-full bg-black">
    {video ? (
      <video
        key={video._id}
        src={resolveProductionFileUrl(video.key, true)}
        poster={cover ? resolveProductionFileUrl(cover.key) : undefined}
        controls
        preload="metadata"
        playsInline
        className="h-full w-full"
      />
    ) : (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/70">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveProductionFileUrl(cover.key)}
            alt=""
            className="absolute inset-0 h-full w-full object-contain opacity-40"
          />
        )}
        <span className="relative text-4xl">{locked ? <FaLock /> : "🎬"}</span>
        <p className="relative text-sm">
          {locked
            ? "Necesitás acceso para ver la película"
            : "Todavía no se subió el video de la película"}
        </p>
      </div>
    )}
  </div>
);

/**
 * Lista de reproducción: capítulos de una serie (video) o temas de un disco
 * (audio). Al terminar uno sigue el próximo que se pueda ver.
 */
const Playlist = ({
  kind,
  tracks,
  cover,
}: {
  kind: "video" | "audio";
  tracks: ProductionItemResponse[];
  cover?: ProductionItemResponse;
}) => {
  const [current, setCurrent] = useState(() =>
    Math.max(0, tracks.findIndex(playable))
  );
  const [autoPlay, setAutoPlay] = useState(false);
  const track = tracks[current];

  const playNext = () => {
    const next = tracks.findIndex(
      (candidate, index) => index > current && playable(candidate)
    );
    if (next !== -1) {
      setAutoPlay(true);
      setCurrent(next);
    }
  };

  if (tracks.length === 0) {
    return (
      <p className="px-4 pt-4 text-sm text-default-500 sm:px-6">
        {kind === "video"
          ? "Todavía no hay videos en esta serie."
          : "Todavía no hay audios en este disco."}
      </p>
    );
  }

  const src =
    track && playable(track)
      ? resolveProductionFileUrl(track.key, kind === "video")
      : undefined;

  const list = (
    <ol
      className={`flex flex-col gap-1 overflow-y-auto ${
        kind === "video" ? "max-h-[50vh] p-2 lg:max-h-none" : ""
      }`}
    >
      {tracks.map((item, index) => {
        const canPlay = playable(item);
        const active = index === current;
        return (
          <li key={item._id}>
            <button
              type="button"
              disabled={!canPlay}
              onClick={() => {
                setAutoPlay(true);
                setCurrent(index);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                active
                  ? "bg-primary/15 font-semibold text-primary"
                  : "hover:bg-default-100"
              } ${canPlay ? "" : "cursor-not-allowed opacity-50"}`}
            >
              <span className="w-6 shrink-0 text-right text-xs text-default-500">
                {active ? <FaPlay className="ml-auto text-[10px]" /> : index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              {!canPlay && <FaLock className="shrink-0 text-xs" />}
            </button>
          </li>
        );
      })}
    </ol>
  );

  if (kind === "audio") {
    return (
      <div className="flex flex-col gap-2">
        {src ? (
          <audio
            key={track._id}
            src={src}
            controls
            autoPlay={autoPlay}
            onEnded={playNext}
            className="w-full"
          />
        ) : (
          <p className="text-xs text-default-500">
            Necesitás acceso para escuchar este tema.
          </p>
        )}
        {list}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 bg-black lg:grid-cols-[1fr_20rem]">
      <div className="aspect-video w-full">
        {src ? (
          <video
            key={track._id}
            src={src}
            poster={cover ? resolveProductionFileUrl(cover.key) : undefined}
            controls
            autoPlay={autoPlay}
            preload="metadata"
            playsInline
            onEnded={playNext}
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
            Necesitás acceso para ver este capítulo
          </div>
        )}
      </div>
      <div className="bg-content1 lg:max-h-[28rem] lg:overflow-y-auto">
        {list}
      </div>
    </div>
  );
};

export default CollectionHeader;
