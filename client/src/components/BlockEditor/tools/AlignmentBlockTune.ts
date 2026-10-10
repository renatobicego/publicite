import type { BlockAPI, BlockTune } from "@editorjs/editorjs";
import type { MenuConfig } from "@editorjs/editorjs/types/tools";

export type BlockAlignment = "left" | "center" | "right" | "justify";

/** Nombre con el que se registra el tune (y clave de `block.tunes`). */
export const ALIGNMENT_TUNE = "alignment";

/** Bloques de texto: los únicos en los que alinear tiene sentido. */
export const ALIGNABLE_BLOCKS = ["paragraph", "header", "list"];

const line = (x1: number, x2: number, y: number) =>
  `<path d="M${x1} ${y}h${x2 - x1}" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;

const icon = (rows: [number, number][]) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">${rows
    .map(([x1, x2], i) => line(x1, x2, 7 + i * 5))
    .join("")}</svg>`;

const ALIGNMENTS: { value: BlockAlignment; title: string; icon: string }[] = [
  { value: "left", title: "Alinear a la izquierda", icon: icon([[5, 19], [5, 13], [5, 17]]) },
  { value: "center", title: "Centrar", icon: icon([[5, 19], [8, 16], [6, 18]]) },
  { value: "right", title: "Alinear a la derecha", icon: icon([[5, 19], [11, 19], [7, 19]]) },
  { value: "justify", title: "Justificar", icon: icon([[5, 19], [5, 19], [5, 19]]) },
];

/**
 * Tune de bloque de Editor.js para alinear el texto (izquierda, centro,
 * derecha, justificado). Aparece en el menú de ajustes del bloque y guarda
 * `{ alignment }` en `block.tunes.alignment`.
 */
export class AlignmentBlockTune implements BlockTune {
  static get isTune() {
    return true;
  }

  private block: BlockAPI;
  private alignment: BlockAlignment;
  private wrapper: HTMLElement | null = null;

  constructor({
    block,
    data,
  }: {
    block: BlockAPI;
    data?: { alignment?: BlockAlignment };
  }) {
    this.block = block;
    this.alignment = data?.alignment ?? "left";
  }

  private get applies(): boolean {
    return ALIGNABLE_BLOCKS.includes(this.block.name);
  }

  render(): MenuConfig {
    if (!this.applies) return [];
    return ALIGNMENTS.map(({ value, title, icon }) => ({
      icon,
      title,
      name: `alignment-${value}`,
      // Mismo `toggle`: funcionan como un grupo de opciones excluyentes.
      toggle: ALIGNMENT_TUNE,
      isActive: () => this.alignment === value,
      closeOnActivate: true,
      onActivate: () => {
        this.alignment = value;
        if (this.wrapper) this.wrapper.style.textAlign = value;
        this.block.dispatchChange();
      },
    }));
  }

  wrap(blockContent: HTMLElement): HTMLElement {
    this.wrapper = document.createElement("div");
    this.wrapper.appendChild(blockContent);
    if (this.applies) this.wrapper.style.textAlign = this.alignment;
    return this.wrapper;
  }

  /** Sólo se guarda si se cambió: "izquierda" es el valor por defecto. */
  save() {
    return this.applies && this.alignment !== "left"
      ? { alignment: this.alignment }
      : undefined;
  }
}
