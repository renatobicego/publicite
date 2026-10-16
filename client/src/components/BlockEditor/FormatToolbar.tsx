"use client";
import type EditorJS from "@editorjs/editorjs";
import type { BlockAPI } from "@editorjs/editorjs";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaAlignCenter,
  FaAlignJustify,
  FaAlignLeft,
  FaAlignRight,
  FaBold,
  FaChevronDown,
  FaFont,
  FaHighlighter,
  FaItalic,
  FaLink,
  FaListOl,
  FaListUl,
  FaRemoveFormat,
  FaStrikethrough,
  FaTextHeight,
  FaUnderline,
} from "react-icons/fa";
import { toastifyError } from "@/utils/functions/toastify";
import {
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
} from "./tools/inlineStyleTools";
import {
  ALIGNABLE_BLOCKS,
  ALIGNMENT_TUNE,
  BlockAlignment,
} from "./tools/AlignmentBlockTune";

type BlockStyle = "paragraph" | "h2" | "h3" | "h4" | "unordered" | "ordered";

const BLOCK_STYLES: { key: BlockStyle; label: string; className: string }[] = [
  { key: "paragraph", label: "Texto normal", className: "text-sm" },
  { key: "h2", label: "Título 1", className: "text-xl font-semibold" },
  { key: "h3", label: "Título 2", className: "text-lg font-semibold" },
  { key: "h4", label: "Título 3", className: "text-base font-semibold" },
  { key: "unordered", label: "Lista con viñetas", className: "text-sm" },
  { key: "ordered", label: "Lista numerada", className: "text-sm" },
];

const ALIGN_BUTTONS: {
  value: BlockAlignment;
  title: string;
  icon: React.ReactNode;
}[] = [
  { value: "left", title: "Alinear a la izquierda", icon: <FaAlignLeft /> },
  { value: "center", title: "Centrar", icon: <FaAlignCenter /> },
  { value: "right", title: "Alinear a la derecha", icon: <FaAlignRight /> },
  { value: "justify", title: "Justificar", icon: <FaAlignJustify /> },
];

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  /** Estilo del bloque donde está el cursor; null si no es de texto. */
  block: BlockStyle | null;
  align: BlockAlignment;
}

const EMPTY_STATE: FormatState = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  block: null,
  align: "left",
};

type MenuKey = "block" | "color" | "highlight" | "size" | "link";

/** Estilo del bloque leído del DOM que pinta Editor.js. */
const blockStyleOf = (blockElement: Element): BlockStyle | null => {
  const content = blockElement.querySelector(".ce-block__content");
  if (content?.querySelector(".ce-paragraph")) return "paragraph";
  const heading = content?.querySelector("h1, h2, h3, h4, h5, h6");
  if (heading) {
    const level = Number(heading.tagName.slice(1));
    return level <= 2 ? "h2" : level === 3 ? "h3" : "h4";
  }
  if (content?.querySelector(".cdx-list-ordered")) return "ordered";
  if (content?.querySelector(".cdx-list")) return "unordered";
  return null;
};

// El tune de alineación envuelve el contenido del bloque en un div con
// `text-align`.
const alignmentOf = (blockElement: Element): BlockAlignment => {
  const wrapper = blockElement.querySelector<HTMLElement>(
    ".ce-block__content > div"
  );
  const value = wrapper?.style.textAlign;
  return value === "center" || value === "right" || value === "justify"
    ? value
    : "left";
};

/** Acepta "sitio.com" y le agrega https; descarta esquemas peligrosos. */
const normalizeLink = (raw: string): string | null => {
  const value = raw.trim();
  if (!value) return null;
  if (/^(https?:|mailto:)/i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
  return `https://${value}`;
};

const ToolButton = ({
  title,
  active = false,
  disabled = false,
  onPress,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    aria-pressed={active}
    disabled={disabled}
    // Sin esto el editor pierde la selección antes del click.
    onMouseDown={(event) => event.preventDefault()}
    onClick={onPress}
    className={`flex h-8 min-w-8 items-center justify-center gap-1 rounded-md px-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
      active
        ? "bg-primary/15 text-primary"
        : "text-default-700 hover:bg-default-100"
    }`}
  >
    {children}
  </button>
);

const Separator = () => (
  <span aria-hidden className="mx-1 hidden h-5 w-px bg-default-200 sm:block" />
);

/**
 * Barra de formato fija arriba del editor, al estilo de un procesador de
 * texto: estilo del bloque (texto, títulos, listas), negrita, cursiva,
 * subrayado, tachado, color, resaltado, tamaño, enlace, alineación y quitar
 * formato. Aplica los mismos comandos que la barra que aparece al seleccionar
 * texto, así que el HTML que genera pasa por las mismas reglas de
 * sanitización.
 */
const FormatToolbar = ({
  getEditor,
  holderId,
  className = "",
  style,
}: {
  getEditor: () => EditorJS | null | undefined;
  holderId: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const [state, setState] = useState<FormatState>(EMPTY_STATE);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [linkValue, setLinkValue] = useState("");
  const toolbarRef = useRef<HTMLDivElement>(null);
  // Última selección dentro del editor: los menús con campos de texto (enlace)
  // se llevan el foco y hay que recuperarla antes de aplicar el formato.
  const savedRange = useRef<Range | null>(null);
  const currentBlockElement = useRef<Element | null>(null);

  const holder = () => document.getElementById(holderId);

  const refresh = useCallback(() => {
    const selection = window.getSelection();
    const anchor = selection?.anchorNode;
    const editorRoot = document.getElementById(holderId);
    if (!selection || !anchor || !editorRoot?.contains(anchor)) return;
    savedRange.current =
      selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
    const element =
      anchor.nodeType === Node.ELEMENT_NODE
        ? (anchor as Element)
        : anchor.parentElement;
    const blockElement = element?.closest(".ce-block") ?? null;
    currentBlockElement.current = blockElement;
    setState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      block: blockElement ? blockStyleOf(blockElement) : null,
      align: blockElement ? alignmentOf(blockElement) : "left",
    });
  }, [holderId]);

  useEffect(() => {
    document.addEventListener("selectionchange", refresh);
    return () => document.removeEventListener("selectionchange", refresh);
  }, [refresh]);

  // Cerrar el menú abierto al tocar fuera de la barra.
  useEffect(() => {
    if (!openMenu) return;
    const close = (event: MouseEvent) => {
      if (!toolbarRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [openMenu]);

  /** Devuelve la selección al editor si se fue (por ejemplo, a un input). */
  const restoreSelection = () => {
    const selection = window.getSelection();
    const inEditor =
      !!selection?.anchorNode && !!holder()?.contains(selection.anchorNode);
    if (inEditor || !savedRange.current || !selection) return inEditor;
    selection.removeAllRanges();
    selection.addRange(savedRange.current);
    return true;
  };

  const exec = (command: string, value?: string, withCss = false) => {
    if (!restoreSelection()) {
      toastifyError("Hacé clic en el texto que querés formatear");
      return;
    }
    // Igual que las herramientas inline: color y tamaño como `<span style>`.
    if (withCss) document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, value);
    if (withCss) document.execCommand("styleWithCSS", false, "false");
    setOpenMenu(null);
    refresh();
  };

  const currentBlock = (): { editor: EditorJS; block: BlockAPI } | null => {
    const editor = getEditor();
    if (!editor) return null;
    const element = currentBlockElement.current;
    const block =
      element instanceof HTMLElement
        ? editor.blocks.getBlockByElement(element)
        : editor.blocks.getBlockByIndex(editor.blocks.getCurrentBlockIndex());
    return block ? { editor, block } : null;
  };

  const applyBlockStyle = async (style: BlockStyle) => {
    setOpenMenu(null);
    const current = currentBlock();
    if (!current || style === state.block) return;
    const { editor, block } = current;
    try {
      let result: BlockAPI;
      if (style === "paragraph") {
        result = await editor.blocks.convert(block.id, "paragraph");
      } else if (style === "unordered" || style === "ordered") {
        result =
          block.name === "list"
            ? await editor.blocks.update(block.id, { style })
            : await editor.blocks.convert(block.id, "list", { style });
      } else {
        const level = Number(style.slice(1));
        result =
          block.name === "header"
            ? await editor.blocks.update(block.id, { level })
            : await editor.blocks.convert(block.id, "header", { level });
      }
      editor.caret.setToBlock(result, "end");
    } catch {
      toastifyError("Este bloque no se puede convertir");
    }
  };

  const applyAlignment = async (align: BlockAlignment) => {
    const current = currentBlock();
    if (!current || !ALIGNABLE_BLOCKS.includes(current.block.name)) return;
    const { editor, block } = current;
    const result = await editor.blocks.update(block.id, undefined, {
      [ALIGNMENT_TUNE]: { alignment: align },
    });
    editor.caret.setToBlock(result, "end");
  };

  const applyLink = () => {
    const url = normalizeLink(linkValue);
    if (!url) {
      toastifyError("Ingresá un enlace válido");
      return;
    }
    exec("createLink", url);
    setLinkValue("");
  };

  const toggleMenu = (menu: MenuKey) =>
    setOpenMenu((current) => (current === menu ? null : menu));

  const isTextBlock = state.block !== null;
  const blockLabel =
    BLOCK_STYLES.find((option) => option.key === state.block)?.label ??
    "Estilo";

  const menuPanel =
    "absolute left-0 top-full z-40 mt-1 min-w-[10rem] rounded-xl border border-default-200 bg-content1 p-1 shadow-lg";

  const swatchMenu = (
    key: "color" | "highlight",
    colors: { title: string; value: string }[],
    command: string
  ) =>
    openMenu === key && (
      <div className={`${menuPanel} grid grid-cols-5 gap-1 p-2`}>
        {colors.map(({ title, value }) => (
          <button
            key={value}
            type="button"
            title={title}
            aria-label={title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => exec(command, value, true)}
            className="h-7 w-7 rounded-full border border-default-300"
            style={{
              backgroundColor: value === "transparent" ? "#ffffff" : value,
            }}
          />
        ))}
      </div>
    );

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Formato de texto"
      style={style}
      className={`flex flex-wrap items-center gap-0.5 rounded-xl border border-default-200 bg-content1/95 p-1 shadow-sm backdrop-blur ${className}`}
    >
      {/* Estilo del bloque */}
      <div className="relative">
        <button
          type="button"
          title="Estilo del párrafo"
          disabled={!isTextBlock}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => toggleMenu("block")}
          className="flex h-8 w-36 items-center justify-between gap-2 rounded-md px-2 text-sm text-default-700 hover:bg-default-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="truncate">{blockLabel}</span>
          <FaChevronDown className="shrink-0 text-xs" />
        </button>
        {openMenu === "block" && (
          <div className={menuPanel}>
            {BLOCK_STYLES.map((option) => (
              <button
                key={option.key}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applyBlockStyle(option.key)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left hover:bg-default-100 ${
                  option.className
                } ${state.block === option.key ? "text-primary" : ""}`}
              >
                {option.key === "unordered" && <FaListUl />}
                {option.key === "ordered" && <FaListOl />}
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <ToolButton
        title="Negrita (Ctrl+B)"
        active={state.bold}
        onPress={() => exec("bold")}
      >
        <FaBold />
      </ToolButton>
      <ToolButton
        title="Cursiva (Ctrl+I)"
        active={state.italic}
        onPress={() => exec("italic")}
      >
        <FaItalic />
      </ToolButton>
      <ToolButton
        title="Subrayado (Ctrl+U)"
        active={state.underline}
        onPress={() => exec("underline")}
      >
        <FaUnderline />
      </ToolButton>
      <ToolButton
        title="Tachado"
        active={state.strikeThrough}
        onPress={() => exec("strikeThrough")}
      >
        <FaStrikethrough />
      </ToolButton>

      <Separator />

      <div className="relative">
        <ToolButton title="Color del texto" onPress={() => toggleMenu("color")}>
          <FaFont className="text-danger" />
          <FaChevronDown className="text-[10px]" />
        </ToolButton>
        {swatchMenu("color", TEXT_COLORS, "foreColor")}
      </div>
      <div className="relative">
        <ToolButton title="Resaltado" onPress={() => toggleMenu("highlight")}>
          <FaHighlighter className="text-warning" />
          <FaChevronDown className="text-[10px]" />
        </ToolButton>
        {swatchMenu("highlight", HIGHLIGHT_COLORS, "hiliteColor")}
      </div>
      <div className="relative">
        <ToolButton title="Tamaño del texto" onPress={() => toggleMenu("size")}>
          <FaTextHeight />
          <FaChevronDown className="text-[10px]" />
        </ToolButton>
        {openMenu === "size" && (
          <div className={menuPanel}>
            {FONT_SIZES.map(({ title, value }) => (
              <button
                key={value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => exec("fontSize", value, true)}
                className="block w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-default-100"
              >
                {title}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <ToolButton title="Enlace" onPress={() => toggleMenu("link")}>
          <FaLink />
        </ToolButton>
        {openMenu === "link" && (
          <form
            className={`${menuPanel} flex w-64 gap-1 p-2`}
            onSubmit={(event) => {
              event.preventDefault();
              applyLink();
            }}
          >
            <input
              autoFocus
              type="text"
              inputMode="url"
              placeholder="https://…"
              aria-label="Dirección del enlace"
              value={linkValue}
              onChange={(event) => setLinkValue(event.target.value)}
              className="min-w-0 flex-1 rounded-md border border-default-300 bg-transparent px-2 py-1 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-3 text-sm font-medium text-white"
            >
              Aplicar
            </button>
          </form>
        )}
      </div>

      <Separator />

      {ALIGN_BUTTONS.map(({ value, title, icon }) => (
        <ToolButton
          key={value}
          title={title}
          active={isTextBlock && state.align === value}
          disabled={!isTextBlock}
          onPress={() => applyAlignment(value)}
        >
          {icon}
        </ToolButton>
      ))}

      <Separator />

      <ToolButton title="Quitar formato" onPress={() => exec("removeFormat")}>
        <FaRemoveFormat />
      </ToolButton>
    </div>
  );
};

export default FormatToolbar;
