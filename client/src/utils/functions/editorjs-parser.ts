import type {
  EditorJSBlock,
  EditorJSData,
  HeaderData,
  ParagraphData,
  ImageData,
} from "@/types/novedades";

/**
 * Parse a stringify JSON data from EditorJS block
 */
export function parseBlockData<T>(data: string): T | null {
  if (typeof data === "object") return data as T;
  try {
    return JSON.parse(data) as T;
  } catch {
    console.error("Failed to parse block data:", data);
    return null;
  }
}

/**
 * Find the first header block in EditorJS content
 */
export function findFirstHeader(
  content: EditorJSData
): { text: string; level: number } | null {
  const headerBlock = content.blocks.find((block) => block.type === "header");
  if (!headerBlock) return null;

  const data = parseBlockData<HeaderData>(headerBlock.data);
  return data ? { text: data.text, level: data.level } : null;
}

/**
 * Find the first paragraph block in EditorJS content
 */
export function findFirstParagraph(content: EditorJSData): string | null {
  const paragraphBlock = content.blocks.find(
    (block) => block.type === "paragraph"
  );
  if (!paragraphBlock) return null;

  const data = parseBlockData<ParagraphData>(paragraphBlock.data);
  return data?.text || null;
}

/**
 * Find the first image block in EditorJS content
 */
export function findFirstImage(
  content: EditorJSData
): { url: string; caption?: string } | null {
  const imageBlock = content.blocks.find((block) => block.type === "image");
  if (!imageBlock) return null;

  const data = parseBlockData<ImageData>(imageBlock.data);
  return data ? { url: data.file.url, caption: data.caption } : null;
}

/**
 * Truncate text to a specific number of lines (approximation)
 */
export function truncateText(text: string, maxChars: number = 150): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trim() + "...";
}

/**
 * Format date to Spanish locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
