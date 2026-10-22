import { sanitizeInlineHtml } from "@/utils/functions/sanitizeBlocks";

/**
 * Texto de un bloque de Editor.js (título o párrafo) con su formato: negrita,
 * links, etc. Se limpia con la misma lista blanca que los artículos antes de
 * insertarlo. El recorte se hace con `line-clamp` en `className`, no cortando
 * el HTML (eso rompería las etiquetas).
 */
const NovedadInlineText = ({
  as: Tag = "p",
  html,
  className,
}: {
  as?: "p" | "h3";
  html: string;
  className?: string;
}) => (
  <Tag
    className={`[&_a]:text-primary [&_a]:underline ${className ?? ""}`}
    dangerouslySetInnerHTML={{ __html: sanitizeInlineHtml(html) }}
  />
);

export default NovedadInlineText;
