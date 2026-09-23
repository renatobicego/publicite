import { API, BlockTool, BlockToolConstructorOptions } from "@editorjs/editorjs";

export interface MediaBlockData {
  file?: {
    url: string;
    key: string;
  };
  title?: string;
}

export type MediaUploader = (
  file: File
) => Promise<{ url: string; key: string } | undefined>;

interface MediaBlockToolConfig {
  uploader: MediaUploader;
  onUploadError?: (message: string) => void;
}

/**
 * Base compartida por los tools de bloque "audio" y "video" de Editor.js.
 * Ambos comparten el mismo flujo: input de archivo -> subida a UploadThing
 * (vía el `uploader` inyectado por config) -> guardar `{ file, title }`.
 * Las subclases sólo definen el ícono, el texto y el tag de preview
 * (`<audio>`/`<video>`).
 */
export abstract class MediaBlockTool implements BlockTool {
  protected api: API;
  protected data: MediaBlockData;
  protected config: MediaBlockToolConfig;
  protected wrapper: HTMLElement | null = null;

  constructor({ data, api, config }: BlockToolConstructorOptions) {
    this.api = api;
    this.data = (data as MediaBlockData) || {};
    this.config = config as MediaBlockToolConfig;
  }

  static get toolbox(): { icon: string; title: string } {
    throw new Error("toolbox debe ser implementado por la subclase");
  }

  protected abstract get acceptMime(): string;
  protected abstract get placeholderIcon(): string;
  protected abstract get placeholderText(): string;
  protected abstract renderPreview(url: string): HTMLElement;

  render(): HTMLElement {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("media-block-tool");

    if (this.data.file?.url) {
      this.wrapper.appendChild(this.renderPreview(this.data.file.url));
    } else {
      this.wrapper.appendChild(this.renderUploadZone());
    }

    return this.wrapper;
  }

  private renderUploadZone(): HTMLElement {
    const zone = document.createElement("div");
    zone.classList.add("media-block-tool__upload-zone");
    zone.style.cssText =
      "display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px;border:2px dashed #d4d4d8;border-radius:12px;cursor:pointer;text-align:center;";
    zone.innerHTML = `<div style="font-size:28px;">${this.placeholderIcon}</div><div style="font-size:14px;color:#71717a;">${this.placeholderText}</div>`;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = this.acceptMime;
    input.style.display = "none";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (file) this.handleUpload(file);
    });

    zone.addEventListener("click", () => input.click());
    zone.appendChild(input);
    return zone;
  }

  private async handleUpload(file: File): Promise<void> {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = "";
    const loading = document.createElement("div");
    loading.style.cssText =
      "padding:24px;text-align:center;font-size:14px;color:#71717a;";
    loading.textContent = "Subiendo...";
    this.wrapper.appendChild(loading);

    try {
      const result = await this.config.uploader(file);
      if (!result) throw new Error("Subida sin resultado");
      this.data.file = result;
      this.data.title = this.data.title || file.name;
      this.wrapper.innerHTML = "";
      this.wrapper.appendChild(this.renderPreview(result.url));
    } catch (error) {
      this.config.onUploadError?.(
        "No se pudo subir el archivo. Intentá de nuevo."
      );
      this.wrapper.innerHTML = "";
      this.wrapper.appendChild(this.renderUploadZone());
    }
  }

  save(_block?: HTMLElement): MediaBlockData {
    return this.data;
  }

  validate(savedData: MediaBlockData): boolean {
    return !!savedData.file?.url;
  }
}
