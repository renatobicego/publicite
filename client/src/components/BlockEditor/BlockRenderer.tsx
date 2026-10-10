"use client";
import { OutputData } from "@editorjs/editorjs";
import { Image } from "@nextui-org/react";
import { FaCheck, FaSquare } from "react-icons/fa6";
import AudioPlayer from "@/components/MediaPlayers/AudioPlayer";
import VideoPlayer from "@/components/MediaPlayers/VideoPlayer";
import { ALIGNMENT_TUNE, BlockAlignment } from "./tools/AlignmentBlockTune";
import {
  sanitizeInlineHtml,
  sanitizeUrl,
} from "@/utils/functions/sanitizeBlocks";

// Todo HTML de un bloque pasa por acá antes de insertarse en la página.
const safeHtml = (html: unknown) => ({ __html: sanitizeInlineHtml(html) });

interface ListItemObj {
  content: string;
  meta?: { checked?: boolean };
  items?: ListItemObj[];
}

interface ListData {
  style: "ordered" | "unordered" | "checklist";
  items: (string | ListItemObj)[];
}

/**
 * Renderiza los bloques de Editor.js (`OutputData`) a JSX de sólo lectura.
 * El HTML de cada bloque se sanitiza acá, venga de donde venga.
 * Soporta header, paragraph, image, list (incluye checklist y anidadas) y link.
 * Reutilizable por artículos de Mis Producciones y cualquier contenido Editor.js.
 */
const BlockRenderer = ({ data }: { data: OutputData }) => {
  const renderListItems = (
    items: (string | ListItemObj)[],
    style: ListData["style"]
  ) =>
    items.map((item, i) => {
      if (typeof item === "string") {
        return style === "checklist" ? (
          <li key={i} className="flex items-start gap-2 mb-2">
            <FaSquare className="h-4 w-4 mt-1 flex-shrink-0" />
            <span dangerouslySetInnerHTML={safeHtml(item)} />
          </li>
        ) : (
          <li key={i} className="mb-2" dangerouslySetInnerHTML={safeHtml(item)} />
        );
      }
      const hasNested = item.items && item.items.length > 0;
      return (
        <li key={i} className={hasNested ? "mb-3" : "mb-2"}>
          {style === "checklist" ? (
            <div className="flex items-start gap-2">
              {item.meta?.checked ? (
                <FaCheck className="h-4 w-4 mt-1 text-secondary flex-shrink-0" />
              ) : (
                <FaSquare className="h-4 w-4 mt-1 border rounded-sm flex-shrink-0" />
              )}
              <span dangerouslySetInnerHTML={safeHtml(item.content)} />
            </div>
          ) : (
            <span dangerouslySetInnerHTML={safeHtml(item.content)} />
          )}
          {hasNested && (
            <ul
              className={`mt-2 ml-6 ${style === "ordered"
                ? "list-decimal"
                : style === "checklist"
                  ? "list-none"
                  : "list-disc"
                } list-inside`}
            >
              {renderListItems(item.items!, style)}
            </ul>
          )}
        </li>
      );
    });

  return (
    <article className="w-full prose prose-lg max-w-none">
      {data.blocks.map((block, index) => {
        // Alineación elegida en el editor (sólo bloques de texto).
        const textAlign = block.tunes?.[ALIGNMENT_TUNE]?.alignment as
          | BlockAlignment
          | undefined;
        const alignStyle = textAlign ? { textAlign } : undefined;
        switch (block.type) {
          case "header": {
            const d = block.data as { text: string; level: number };
            const HeadingTag = `h${d.level}` as keyof React.JSX.IntrinsicElements;
            // El encabezado también admite formato (color, subrayado, etc.).
            return (
              <HeadingTag
                key={index}
                className="font-bold mb-4 [&_a]:text-primary [&_a]:underline"
                style={alignStyle}
                dangerouslySetInnerHTML={safeHtml(d.text)}
              />
            );
          }
          case "paragraph": {
            const d = block.data as { text: string };
            return (
              <p
                key={index}
                className="leading-relaxed mb-4 [&_a]:text-primary [&_a]:underline"
                style={alignStyle}
                dangerouslySetInnerHTML={safeHtml(d.text)}
              />
            );
          }
          case "image": {
            const d = block.data as {
              file: { url: string };
              caption?: string;
              stretched?: boolean;
            };
            return (
              <figure key={index} className="my-8">
                <Image
                  src={d.file?.url}
                  alt={d.caption || "Imagen"}
                  className={`w-full ${d.stretched ? "max-w-full" : "max-w-3xl mx-auto"
                    }`}
                  radius="none"
                />
                {d.caption && (
                  <figcaption className="text-left text-sm text-default-500 mt-2">
                    {d.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          case "list": {
            const d = block.data as ListData;
            if (d.style === "checklist") {
              return (
                <ul key={index} className="list-none mb-4" style={alignStyle}>
                  {renderListItems(d.items, d.style)}
                </ul>
              );
            }
            const ListTag = d.style === "ordered" ? "ol" : "ul";
            return (
              <ListTag
                key={index}
                className={`${d.style === "ordered" ? "list-decimal" : "list-disc"
                  } list-inside mb-4`}
                style={alignStyle}
              >
                {renderListItems(d.items, d.style)}
              </ListTag>
            );
          }
          case "audio": {
            const d = block.data as { file?: { url: string }; title?: string };
            if (!d.file?.url) return null;
            return (
              <div key={index} className="my-6">
                <AudioPlayer src={d.file.url} title={d.title || "Audio"} />
              </div>
            );
          }
          case "video": {
            const d = block.data as { file?: { url: string }; title?: string };
            if (!d.file?.url) return null;
            return (
              <div key={index} className="my-6">
                <VideoPlayer src={d.file.url} />
              </div>
            );
          }
          case "photoGrid": {
            const d = block.data as {
              images?: { url: string; key: string }[];
              columns?: 2 | 3;
            };
            const images = (d.images ?? []).filter((img) => img?.url);
            if (images.length === 0) return null;
            // Mobile: una foto arriba de la otra (1 columna). Desde `sm`,
            // 2 o 3 columnas según lo elegido. Las fotos conservan su
            // relación de aspecto original (sin recorte).
            const columnsClass =
              d.columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
            return (
              <div
                key={index}
                className={`my-6 grid grid-cols-1 gap-2 ${columnsClass}`}
              >
                {images.map((img, i) => (
                  <Image
                    key={i}
                    src={img.url}
                    alt={`Foto ${i + 1}`}
                    radius="sm"
                    classNames={{
                      wrapper: "!max-w-full w-full",
                      img: "w-full h-auto object-contain",
                    }}
                  />
                ))}
              </div>
            );
          }
          case "linkTool":
          case "link": {
            const d = block.data as {
              link: string;
              meta?: { title?: string; description?: string };
            };
            return (
              <a
                key={index}
                href={sanitizeUrl(d.link) || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="block my-4 p-3 rounded-lg border hover:bg-default-100"
              >
                <span className="font-medium">{d.meta?.title || d.link}</span>
                {d.meta?.description && (
                  <span className="block text-sm text-default-500">
                    {d.meta.description}
                  </span>
                )}
              </a>
            );
          }
          default:
            return null;
        }
      })}
    </article>
  );
};

export default BlockRenderer;
