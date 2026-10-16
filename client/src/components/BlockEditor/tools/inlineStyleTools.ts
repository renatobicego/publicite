import type { InlineTool, SanitizerConfig } from "@editorjs/editorjs";
import type { MenuConfig } from "@editorjs/editorjs/types/tools";

/**
 * Herramientas de formato de texto del editor (subrayado, tachado, color,
 * resaltado, tamaño y limpiar formato), al estilo de un procesador de texto.
 *
 * Aplican el formato con `document.execCommand`, igual que la negrita y la
 * cursiva propias de Editor.js: el navegador resuelve selecciones parciales,
 * anidadas y el "volver a aplicar para quitar".
 */

// Editor.js limpia el HTML al guardar y sólo deja pasar lo que declaran las
// herramientas. Todas declaran la MISMA regla porque las reglas de una misma
// etiqueta no se combinan entre herramientas: la última pisa a las demás.
const INLINE_STYLE_SANITIZE: SanitizerConfig = {
  span: { style: true },
  font: { color: true, size: true, style: true },
  u: {},
  s: {},
  strike: {},
};

const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">${body}</svg>`;

const swatch = (color: string) =>
  svg(
    `<circle cx="12" cy="12" r="7" fill="${color}" stroke="currentColor" stroke-opacity="0.25"/>`
  );

/** Herramienta inline de Editor.js sin estado: sólo define su botón. */
abstract class InlineStyleTool implements InlineTool {
  static get isInline() {
    return true;
  }

  static get sanitize(): SanitizerConfig {
    return INLINE_STYLE_SANITIZE;
  }

  // Elegir una opción de un submenú puede hacer perder la selección del texto:
  // se guarda al abrir la barra (momento en que Editor.js llama a `render`).
  private savedRange: Range | null = null;

  protected rememberSelection() {
    const selection = window.getSelection();
    this.savedRange =
      selection && selection.rangeCount > 0
        ? selection.getRangeAt(0).cloneRange()
        : null;
  }

  /** Aplica un comando sobre la selección (o la recupera si se perdió). */
  protected exec(command: string, value?: string, withCss = false) {
    const selection = window.getSelection();
    if (selection?.isCollapsed && this.savedRange) {
      selection.removeAllRanges();
      selection.addRange(this.savedRange);
    }
    // `styleWithCSS` hace que colores y tamaños salgan como `<span style>`.
    // Se apaga enseguida para no cambiar cómo se guardan negrita y cursiva.
    if (withCss) document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, value);
    if (withCss) document.execCommand("styleWithCSS", false, "false");
  }

  abstract render(): MenuConfig;
}

export class UnderlineInlineTool extends InlineStyleTool {
  static title = "Subrayado";
  static shortcut = "CMD+U";

  render(): MenuConfig {
    return {
      icon: svg(
        `<path d="M8 6v5a4 4 0 0 0 8 0V6M7 18h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
      ),
      name: "underline",
      onActivate: () => this.exec("underline"),
      isActive: () => document.queryCommandState("underline"),
    };
  }
}

export class StrikethroughInlineTool extends InlineStyleTool {
  static title = "Tachado";

  render(): MenuConfig {
    return {
      icon: svg(
        `<path d="M6 12h12M15.5 8.5C15 7 13.7 6.5 12 6.5c-2 0-3.5 1-3.5 2.6 0 1 .6 1.7 1.6 2.2M8.5 15.5c.5 1.4 1.8 2 3.5 2 2.1 0 3.5-1 3.5-2.6 0-.5-.1-.9-.4-1.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
      ),
      name: "strikethrough",
      onActivate: () => this.exec("strikeThrough"),
      isActive: () => document.queryCommandState("strikeThrough"),
    };
  }
}

export const TEXT_COLORS = [
  { title: "Negro", value: "#18181b" },
  { title: "Gris", value: "#71717a" },
  { title: "Rojo", value: "#dc2626" },
  { title: "Naranja", value: "#ea580c" },
  { title: "Amarillo", value: "#ca8a04" },
  { title: "Verde", value: "#16a34a" },
  { title: "Celeste", value: "#0891b2" },
  { title: "Azul", value: "#2563eb" },
  { title: "Violeta", value: "#7c3aed" },
  { title: "Rosa", value: "#db2777" },
];

export class TextColorInlineTool extends InlineStyleTool {
  static title = "Color del texto";

  render(): MenuConfig {
    this.rememberSelection();
    return {
      icon: svg(
        `<path d="M8 15l4-9 4 9M9.3 12h5.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 19h12" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>`
      ),
      name: "textColor",
      children: {
        items: TEXT_COLORS.map(({ title, value }) => ({
          icon: swatch(value),
          title,
          closeOnActivate: true,
          onActivate: () => this.exec("foreColor", value, true),
        })),
      },
    };
  }
}

export const HIGHLIGHT_COLORS = [
  { title: "Amarillo", value: "#fef08a" },
  { title: "Verde", value: "#bbf7d0" },
  { title: "Celeste", value: "#bae6fd" },
  { title: "Rosa", value: "#fbcfe8" },
  { title: "Naranja", value: "#fed7aa" },
  { title: "Violeta", value: "#ddd6fe" },
  { title: "Sin resaltado", value: "transparent" },
];

export class HighlightInlineTool extends InlineStyleTool {
  static title = "Resaltado";

  render(): MenuConfig {
    this.rememberSelection();
    return {
      icon: svg(
        `<path d="M14.5 5.5l4 4-7 7H7.5v-4l7-7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M5 20h14" stroke="#eab308" stroke-width="2.5" stroke-linecap="round"/>`
      ),
      name: "highlight",
      children: {
        items: HIGHLIGHT_COLORS.map(({ title, value }) => ({
          icon: swatch(value === "transparent" ? "#ffffff" : value),
          title,
          closeOnActivate: true,
          onActivate: () => this.exec("hiliteColor", value, true),
        })),
      },
    };
  }
}

// `fontSize` de execCommand usa la escala 1-7 de HTML (3 = tamaño normal).
export const FONT_SIZES = [
  { title: "Chico", value: "2" },
  { title: "Normal", value: "3" },
  { title: "Grande", value: "5" },
  { title: "Muy grande", value: "6" },
];

export class FontSizeInlineTool extends InlineStyleTool {
  static title = "Tamaño del texto";

  render(): MenuConfig {
    this.rememberSelection();
    const icon = svg(
      `<path d="M4 18l4-10 4 10M5.5 14.5h5M14 18l3-7 3 7M15.1 15.5h3.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
    );
    return {
      icon,
      name: "fontSize",
      children: {
        items: FONT_SIZES.map(({ title, value }) => ({
          icon,
          title,
          closeOnActivate: true,
          onActivate: () => this.exec("fontSize", value, true),
        })),
      },
    };
  }
}

export class ClearFormatInlineTool extends InlineStyleTool {
  static title = "Quitar formato";

  render(): MenuConfig {
    return {
      icon: svg(
        `<path d="M7 6h10M12 6l-2 9M6 19h6M15 14l4 4M19 14l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
      ),
      name: "clearFormat",
      closeOnActivate: true,
      onActivate: () => this.exec("removeFormat"),
    };
  }
}
