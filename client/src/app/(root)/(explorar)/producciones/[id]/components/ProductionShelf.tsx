"use client";
import { useState } from "react";
import {
  Button,
  Chip,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@nextui-org/react";
import {
  FaBook,
  FaExternalLinkAlt,
  FaFilm,
  FaGamepad,
  FaGlobe,
  FaImage,
  FaMapMarkerAlt,
  FaMusic,
  FaPen,
  FaPodcast,
  FaYoutube,
} from "react-icons/fa";
import {
  ProductionShelfCategory,
  ProductionShelfLink,
} from "@/types/productionTypes";
import YouTubeEmbed from "@/components/MediaPlayers/YouTubeEmbed";
import { parseYouTubeId } from "@/utils/functions/youtube";
import { resolveProductionFileUrl } from "../../productionMedia";
import {
  safeShelfLink,
  shelfCategoryLabel,
  spineColor,
  spineHeight,
} from "../../productionShelf";
import ShelfEditorModal from "./ShelfEditorModal";

const CATEGORY_ICON: Record<ProductionShelfCategory, React.ReactNode> = {
  [ProductionShelfCategory.books]: <FaBook />,
  [ProductionShelfCategory.movies]: <FaFilm />,
  [ProductionShelfCategory.podcasts]: <FaPodcast />,
  [ProductionShelfCategory.music]: <FaMusic />,
  [ProductionShelfCategory.youtube]: <FaYoutube />,
  [ProductionShelfCategory.websites]: <FaGlobe />,
  [ProductionShelfCategory.images]: <FaImage />,
  [ProductionShelfCategory.games]: <FaGamepad />,
  [ProductionShelfCategory.places]: <FaMapMarkerAlt />,
};

interface Props {
  productionId: string;
  shelf: ProductionShelfLink[];
  canEdit: boolean;
  onChanged: () => void;
}

/**
 * Estantería del blog: objetos rectangulares uno al lado del otro, como en un
 * estante. Los que tienen imagen se ven "de frente" (portada); el resto, de
 * lomo con el título. Al tocar uno se abre su ficha.
 */
const ProductionShelf = ({ productionId, shelf, canEdit, onChanged }: Props) => {
  const editor = useDisclosure();

  // Un visitante no ve un estante vacío.
  if (shelf.length === 0 && !canEdit) return null;

  return (
    <section aria-label="Estantería" className="w-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Estantería</h3>
        {canEdit && (
          <Button
            size="sm"
            variant="light"
            startContent={<FaPen />}
            onPress={editor.onOpen}
          >
            {shelf.length > 0 ? "Editar estante" : "Armar estante"}
          </Button>
        )}
      </div>

      {shelf.length === 0 ? (
        <button
          type="button"
          onClick={editor.onOpen}
          className="flex w-full flex-col items-center gap-1 rounded-xl border border-dashed border-default-300 px-4 py-6 text-center text-sm text-default-500 hover:bg-default-50"
        >
          <span className="text-2xl">📚</span>
          Poné en el estante libros, películas, podcasts, música o links que
          quieras recomendar.
        </button>
      ) : (
        <div className="relative">
          {/* Los objetos apoyados sobre la tabla del estante */}
          <div className="flex h-48 items-end gap-1.5 overflow-x-auto px-3 pt-2 [scrollbar-width:thin]">
            {shelf.map((entry, index) => (
              <ShelfObject key={`${entry.title}-${index}`} entry={entry} />
            ))}
          </div>
          {/* Tabla del estante */}
          <div className="h-3 rounded-sm bg-gradient-to-b from-[#a0703f] to-[#6b4423] shadow-md dark:from-[#6b4a2b] dark:to-[#3f2914]" />
          <div className="mx-2 h-1.5 rounded-b bg-black/10 dark:bg-black/30" />
        </div>
      )}

      {canEdit && (
        <ShelfEditorModal
          productionId={productionId}
          shelf={shelf}
          isOpen={editor.isOpen}
          onOpenChange={editor.onOpenChange}
          onSaved={onChanged}
        />
      )}
    </section>
  );
};

const ShelfObject = ({ entry }: { entry: ProductionShelfLink }) => {
  const [open, setOpen] = useState(false);
  const color = spineColor(entry.title);
  const height = spineHeight(entry.title);
  const hasCover = !!entry.imageKey;

  return (
    <Popover placement="top" isOpen={open} onOpenChange={setOpen} showArrow>
      <PopoverTrigger>
        <button
          type="button"
          title={entry.subtitle ? `${entry.title} · ${entry.subtitle}` : entry.title}
          aria-label={`${shelfCategoryLabel(entry.category)}: ${entry.title}`}
          style={{ height: `${height}%` }}
          className={`group relative shrink-0 overflow-hidden rounded-t-[3px] rounded-b-[1px] shadow-[inset_-3px_0_6px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-200 hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
            hasCover ? "w-24 sm:w-28" : "w-11 sm:w-12"
          } ${open ? "-translate-y-2" : ""}`}
        >
          {hasCover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveProductionFileUrl(entry.imageKey!)}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="flex h-full w-full flex-col items-center justify-between py-2 text-white"
              style={{ backgroundColor: color }}
            >
              <span className="text-xs opacity-80">
                {CATEGORY_ICON[entry.category]}
              </span>
              {/* Título vertical, como en el lomo de un libro */}
              <span className="max-h-[75%] overflow-hidden text-ellipsis whitespace-nowrap px-1 text-[11px] font-semibold leading-tight tracking-wide [writing-mode:vertical-rl] rotate-180 sm:text-xs">
                {entry.title}
              </span>
              <span className="h-1 w-6 rounded-full bg-white/30" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 max-w-[calc(100vw-2rem)] p-0">
        <ShelfCard entry={entry} />
      </PopoverContent>
    </Popover>
  );
};

/** Ficha del objeto: portada o video, título, subtítulo y link. */
const ShelfCard = ({ entry }: { entry: ProductionShelfLink }) => {
  const link = safeShelfLink(entry.link);
  const youtubeId =
    entry.category === ProductionShelfCategory.youtube
      ? parseYouTubeId(entry.link)
      : null;

  return (
    <div className="flex w-full flex-col gap-2 p-3">
      {youtubeId ? (
        <YouTubeEmbed video={youtubeId} title={entry.title} />
      ) : (
        entry.imageKey && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveProductionFileUrl(entry.imageKey)}
            alt={entry.title}
            className="max-h-64 w-full rounded-medium object-contain bg-default-100"
          />
        )
      )}
      <Chip
        size="sm"
        variant="flat"
        startContent={
          <span className="ml-1 text-xs">{CATEGORY_ICON[entry.category]}</span>
        }
      >
        {shelfCategoryLabel(entry.category)}
      </Chip>
      <div>
        <p className="font-semibold leading-tight">{entry.title}</p>
        {entry.subtitle && (
          <p className="text-sm text-default-500">{entry.subtitle}</p>
        )}
      </div>
      {link && (
        <Button
          as={Link}
          href={link}
          isExternal
          size="sm"
          color="primary"
          variant="flat"
          endContent={<FaExternalLinkAlt className="text-xs" />}
        >
          Abrir
        </Button>
      )}
    </div>
  );
};

export default ProductionShelf;
