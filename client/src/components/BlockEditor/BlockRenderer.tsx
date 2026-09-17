"use client";
import { OutputData } from "@editorjs/editorjs";
import { Image } from "@nextui-org/react";
import { FaCheck, FaSquare } from "react-icons/fa6";

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
            <span dangerouslySetInnerHTML={{ __html: item }} />
          </li>
        ) : (
          <li key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: item }} />
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
              <span dangerouslySetInnerHTML={{ __html: item.content }} />
            </div>
          ) : (
            <span dangerouslySetInnerHTML={{ __html: item.content }} />
          )}
          {hasNested && (
            <ul
              className={`mt-2 ml-6 ${
                style === "ordered"
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
        switch (block.type) {
          case "header": {
            const d = block.data as { text: string; level: number };
            const HeadingTag = `h${d.level}` as keyof JSX.IntrinsicElements;
            return (
              <HeadingTag key={index} className="font-bold mb-4">
                {d.text}
              </HeadingTag>
            );
          }
          case "paragraph": {
            const d = block.data as { text: string };
            return (
              <p
                key={index}
                className="leading-relaxed mb-4 [&>a]:text-primary [&>a]:underline"
                dangerouslySetInnerHTML={{ __html: d.text }}
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
                  className={`w-full ${
                    d.stretched ? "max-w-full" : "max-w-3xl mx-auto"
                  }`}
                  radius="lg"
                />
                {d.caption && (
                  <figcaption className="text-center text-sm text-default-500 mt-2">
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
                <ul key={index} className="list-none mb-4">
                  {renderListItems(d.items, d.style)}
                </ul>
              );
            }
            const ListTag = d.style === "ordered" ? "ol" : "ul";
            return (
              <ListTag
                key={index}
                className={`${
                  d.style === "ordered" ? "list-decimal" : "list-disc"
                } list-inside mb-4`}
              >
                {renderListItems(d.items, d.style)}
              </ListTag>
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
                href={d.link}
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
