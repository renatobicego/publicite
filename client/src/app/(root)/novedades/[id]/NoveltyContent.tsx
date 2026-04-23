"use client";

import { Novedad } from "@/types/novedades";
import { parseBlockData, formatDate } from "@/utils/functions/editorjs-parser";
import { Chip, Image } from "@nextui-org/react";
import Link from "next/link";
import { FaArrowLeft, FaCheck, FaSquare } from "react-icons/fa6";

interface NoveltyContentProps {
  novelty: Novedad;
}

interface ListItem {
  content: string;
  meta?: any;
  items?: ListItem[];
}

interface ListData {
  style: "ordered" | "unordered" | "checklist";
  items: (string | ListItem)[];
  meta?: any;
}

interface LinkData {
  link: string;
  meta?: {
    title?: string;
    description?: string;
    image?: {
      url: string;
    };
  };
}

export default function NoveltyContent({ novelty }: NoveltyContentProps) {
  const renderListItems = (
    items: (string | ListItem)[],
    style: "ordered" | "unordered" | "checklist",
    isNested = false
  ) => {
    return items.map((item, i) => {
      // Handle old format (string)
      if (typeof item === "string") {
        if (style === "checklist") {
          return (
            <li key={i} className="flex items-start gap-2 mb-2">
              <FaSquare className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          );
        }
        return (
          <li
            key={i}
            className="mb-2"
            dangerouslySetInnerHTML={{ __html: item }}
          />
        );
      }

      // Handle new format (object with nested items)
      const hasNestedItems = item.items && item.items.length > 0;
      const isChecked = item.meta?.checked;

      return (
        <li key={i} className={hasNestedItems ? "mb-3" : "mb-2"}>
          {style === "checklist" ? (
            <div className="flex items-start gap-2">
              {isChecked ? (
                <FaCheck className="h-4 w-4 mt-1 text-secondary flex-shrink-0" />
              ) : (
                <FaSquare className="h-4 w-4 mt-1 text-white border border-secondary rounded-sm flex-shrink-0" />
              )}
              <span dangerouslySetInnerHTML={{ __html: item.content }} />
            </div>
          ) : (
            <span dangerouslySetInnerHTML={{ __html: item.content }} />
          )}

          {hasNestedItems && (
            <ul
              className={`mt-2 ml-6 ${
                style === "ordered"
                  ? "list-decimal"
                  : style === "checklist"
                  ? "list-none"
                  : "list-disc"
              } list-inside`}
            >
              {renderListItems(item.items!, style, true)}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <>
      {/* Back button */}
      <Link
        href="/novedades"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-text-color transition-colors"
      >
        <FaArrowLeft className="h-4 w-4" />
        Volver a novedades
      </Link>

      {/* Date */}
      <Chip className="text-xs" size="sm" variant="bordered">
        {formatDate(novelty.createdAt)}
      </Chip>

      {/* Content */}
      <article className="w-full prose prose-xl max-w-none">
        {novelty.content.blocks.map((block, index) => {
          switch (block.type) {
            case "header": {
              const data = parseBlockData<{ text: string; level: number }>(
                JSON.stringify(block.data)
              );
              if (!data) return null;

              const HeadingTag =
                `h${data.level}` as keyof JSX.IntrinsicElements;
              return (
                <HeadingTag
                  key={index}
                  className="font-bold text-text-color mb-4"
                >
                  {data.text}
                </HeadingTag>
              );
            }

            case "paragraph": {
              const data = parseBlockData<{ text: string }>(
                JSON.stringify(block.data)
              );
              if (!data) return null;

              return (
                <p
                  key={index}
                  className="text-text-color leading-relaxed mb-4 [&>a]:text-primary [&>a]:underline"
                  dangerouslySetInnerHTML={{ __html: data.text }}
                />
              );
            }

            case "image": {
              const data = parseBlockData<{
                file: { url: string };
                caption?: string;
                withBorder?: boolean;
                stretched?: boolean;
                withBackground?: boolean;
              }>(JSON.stringify(block.data));
              if (!data) return null;

              return (
                <figure key={index} className="my-8">
                  <Image
                    src={data.file.url}
                    alt={data.caption || "Imagen"}
                    className={`w-full ${
                      data.stretched ? "max-w-full" : "max-w-3xl mx-auto"
                    } ${data.withBorder ? "border border-border" : ""} ${
                      data.withBackground ? "bg-muted p-4" : ""
                    }`}
                    radius="lg"
                  />
                  {data.caption && (
                    <figcaption className="text-center text-sm text-muted-foreground mt-2">
                      {data.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }

            case "list": {
              const data = parseBlockData<ListData>(JSON.stringify(block.data));
              if (!data) return null;

              const { style, items } = data;

              if (style === "checklist") {
                return (
                  <ul key={index} className="list-none mb-4 text-text-color">
                    {renderListItems(items, style)}
                  </ul>
                );
              }

              const ListTag = style === "ordered" ? "ol" : "ul";
              return (
                <ListTag
                  key={index}
                  className={`${
                    style === "ordered" ? "list-decimal" : "list-disc"
                  } list-inside mb-4 text-text-color`}
                >
                  {renderListItems(items, style)}
                </ListTag>
              );
            }

            default:
              return null;
          }
        })}
      </article>
    </>
  );
}
