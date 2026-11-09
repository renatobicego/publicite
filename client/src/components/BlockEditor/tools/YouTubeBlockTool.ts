import { BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";
import {
  parseYouTubeId,
  parseYouTubeStart,
  youTubeEmbedUrl,
} from "@/utils/functions/youtube";

export interface YouTubeBlockData {
  /** Link que pegó el autor (se guarda tal cual, para poder editarlo). */
  url?: string;
  /** Id del video: es lo único que se usa para armar el reproductor. */
  videoId?: string;
  /** Segundo de inicio, si el link lo traía (`?t=`). */
  start?: number;
  caption?: string;
}

/**
 * Bloque "Video de YouTube" para Editor.js: se pega el link y queda el
 * reproductor embebido. No sube nada a UploadThing ni ocupa almacenamiento.
 * El render final lo hace `BlockRenderer` (`YouTubeEmbed`).
 */
export class YouTubeBlockTool implements BlockTool {
  private data: YouTubeBlockData;
  private readOnly: boolean;
  private wrapper: HTMLElement | null = null;

  constructor({ data, readOnly }: BlockToolConstructorOptions) {
    this.data = (data as YouTubeBlockData) || {};
    this.readOnly = !!readOnly;
  }

  static get toolbox() {
    return {
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" stroke-width="1.8"/><path d="M10 9.5v5l4.5-2.5L10 9.5z" fill="currentColor"/></svg>',
      title: "YouTube",
    };
  }

  static get isReadOnlySupported(): boolean {
    return true;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement("div");
    this.wrapper.style.cssText = "padding:8px 0;";
    this.paint();
    return this.wrapper;
  }

  private paint() {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = "";
    if (this.data.videoId) {
      this.wrapper.appendChild(this.renderPreview(this.data.videoId));
    } else if (!this.readOnly) {
      this.wrapper.appendChild(this.renderInput());
    }
  }

  private renderInput(): HTMLElement {
    const box = document.createElement("div");
    box.style.cssText =
      "display:flex;flex-direction:column;gap:6px;padding:12px;border:1px dashed #d4d4d8;border-radius:8px;";

    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:8px;";

    const input = document.createElement("input");
    input.type = "url";
    input.placeholder = "Pegá el link del video de YouTube";
    input.value = this.data.url ?? "";
    input.style.cssText =
      "flex:1;min-width:0;padding:8px 10px;border:1px solid #d4d4d8;border-radius:6px;font-size:14px;background:transparent;";

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Insertar";
    button.style.cssText =
      "padding:8px 14px;border-radius:6px;background:#007bff;color:#fff;font-size:14px;cursor:pointer;";

    const error = document.createElement("span");
    error.style.cssText = "color:#e11d48;font-size:12px;display:none;";
    error.textContent =
      "No es un link de YouTube válido (ej. https://www.youtube.com/watch?v=…)";

    const submit = () => {
      const videoId = parseYouTubeId(input.value);
      if (!videoId) {
        error.style.display = "block";
        return;
      }
      this.data = {
        ...this.data,
        url: input.value.trim(),
        videoId,
        start: parseYouTubeStart(input.value) || undefined,
      };
      this.paint();
    };

    button.addEventListener("click", submit);
    input.addEventListener("keydown", (event) => {
      // Enter en Editor.js crea un bloque nuevo: acá confirma el link.
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        submit();
      }
    });
    input.addEventListener("paste", () => {
      setTimeout(() => {
        if (parseYouTubeId(input.value)) submit();
      });
    });

    row.append(input, button);
    box.append(row, error);
    return box;
  }

  private renderPreview(videoId: string): HTMLElement {
    const container = document.createElement("div");
    container.style.cssText = "display:flex;flex-direction:column;gap:6px;";

    const frameBox = document.createElement("div");
    frameBox.style.cssText =
      "position:relative;width:100%;aspect-ratio:16/9;border-radius:8px;overflow:hidden;background:#000;";
    const iframe = document.createElement("iframe");
    iframe.src = youTubeEmbedUrl(videoId, this.data.start ?? 0);
    iframe.title = "Video de YouTube";
    iframe.allow =
      "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;";
    frameBox.appendChild(iframe);
    container.appendChild(frameBox);

    const caption = document.createElement("div");
    caption.contentEditable = this.readOnly ? "false" : "true";
    caption.dataset.placeholder = "Descripción (opcional)";
    caption.textContent = this.data.caption ?? "";
    caption.style.cssText =
      "font-size:14px;color:#71717a;outline:none;min-height:20px;";
    caption.addEventListener("input", () => {
      this.data.caption = caption.textContent ?? "";
    });
    if (!this.readOnly || this.data.caption) container.appendChild(caption);

    if (!this.readOnly) {
      const change = document.createElement("button");
      change.type = "button";
      change.textContent = "Cambiar video";
      change.style.cssText =
        "align-self:flex-start;font-size:12px;color:#007bff;cursor:pointer;background:none;";
      change.addEventListener("click", () => {
        this.data = { url: this.data.url, caption: this.data.caption };
        this.paint();
      });
      container.appendChild(change);
    }
    return container;
  }

  save(): YouTubeBlockData {
    return {
      url: this.data.url,
      videoId: this.data.videoId,
      start: this.data.start,
      caption: this.data.caption?.trim() || undefined,
    };
  }

  validate(data: YouTubeBlockData): boolean {
    // Un bloque sin video válido no se guarda.
    return !!parseYouTubeId(data.videoId);
  }
}
