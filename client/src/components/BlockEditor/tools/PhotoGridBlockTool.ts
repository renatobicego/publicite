import {
  API,
  BlockTool,
  BlockToolConstructorOptions,
} from "@editorjs/editorjs";
import { MenuConfig } from "@editorjs/editorjs/types/tools/menu-config";
import {
  ALLOWED_IMAGE_ACCEPT,
  INVALID_IMAGE_FORMAT_MESSAGE,
  isAllowedImageFile,
} from "@/utils/functions/imageFormats";

export interface PhotoGridImage {
  url: string;
  key: string;
}

export interface PhotoGridData {
  images: PhotoGridImage[];
  /** Cantidad de columnas de la grilla: 2 o 3. Default: 2. */
  columns: 2 | 3;
}

export type PhotoGridUploader = (
  file: File
) => Promise<PhotoGridImage | undefined>;

interface PhotoGridToolConfig {
  uploader: PhotoGridUploader;
  onUploadError?: (message: string) => void;
  /** Se llama cuando se saca una imagen del grid (para limpiar UploadThing). */
  onRemoveImage?: (image: PhotoGridImage) => void;
}

/**
 * Bloque de "grilla de fotos" para Editor.js.
 *
 * Permite subir varias imágenes a UploadThing (vía el `uploader` inyectado por
 * config) y elegir entre 2 y 3 columnas mediante los "block tunes" (el menú de
 * ajustes del bloque). El render final fuera del editor lo hace `BlockRenderer`.
 *
 * Persiste `{ images: [{ url, key }], columns }`; el `key` es lo que se usa
 * para resolver la URL de UploadThing y para limpiar archivos borrados.
 */
export class PhotoGridBlockTool implements BlockTool {
  private api: API;
  private data: PhotoGridData;
  private config: PhotoGridToolConfig;
  private wrapper: HTMLElement | null = null;

  constructor({ data, api, config }: BlockToolConstructorOptions) {
    this.api = api;
    const incoming = (data as Partial<PhotoGridData>) || {};
    this.data = {
      images: Array.isArray(incoming.images) ? incoming.images : [],
      columns: incoming.columns === 3 ? 3 : 2,
    };
    this.config = config as PhotoGridToolConfig;
  }

  static get toolbox() {
    return {
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.8"/></svg>',
      title: "Grilla de fotos",
    };
  }

  static get isReadOnlySupported(): boolean {
    return true;
  }

  render(): HTMLElement {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("photo-grid-tool");
    this.renderContent();
    return this.wrapper;
  }

  /** Repinta el interior del bloque según el estado actual (`this.data`). */
  private renderContent(): void {
    if (!this.wrapper) return;
    this.wrapper.innerHTML = "";

    if (this.data.images.length > 0) {
      this.wrapper.appendChild(this.renderGrid());
    }
    this.wrapper.appendChild(this.renderUploadZone());
  }

  private renderGrid(): HTMLElement {
    const grid = document.createElement("div");
    // Mobile: 1 columna (una foto sobre otra). >=640px: 2 o 3 columnas.
    const isNarrow =
      typeof window !== "undefined" && window.innerWidth < 640;
    const columns = isNarrow ? 1 : this.data.columns;
    grid.style.cssText = `display:grid;grid-template-columns:repeat(${columns},1fr);gap:8px;margin-bottom:8px;align-items:start;`;

    this.data.images.forEach((image, index) => {
      const cell = document.createElement("div");
      cell.style.cssText =
        "position:relative;border-radius:8px;overflow:hidden;background:#f4f4f5;";

      const img = document.createElement("img");
      img.src = image.url;
      img.alt = `Foto ${index + 1}`;
      // Conserva la relación de aspecto original (sin recorte).
      img.style.cssText =
        "display:block;width:100%;height:auto;object-fit:contain;";
      cell.appendChild(img);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.innerHTML = "&times;";
      remove.title = "Quitar foto";
      remove.style.cssText =
        "position:absolute;top:4px;right:4px;width:24px;height:24px;border:none;border-radius:9999px;background:rgba(0,0,0,0.6);color:#fff;font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;";
      remove.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeImage(index);
      });
      cell.appendChild(remove);

      grid.appendChild(cell);
    });

    return grid;
  }

  private renderUploadZone(): HTMLElement {
    const zone = document.createElement("div");
    zone.classList.add("photo-grid-tool__upload-zone");
    zone.style.cssText =
      "display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;border:2px dashed #d4d4d8;border-radius:12px;cursor:pointer;text-align:center;";
    const label =
      this.data.images.length > 0
        ? "Agregar más fotos"
        : "Hacé clic para subir fotos";
    zone.innerHTML = `<div style="font-size:28px;">🖼️</div><div style="font-size:14px;color:#71717a;">${label}</div>`;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ALLOWED_IMAGE_ACCEPT;
    input.multiple = true;
    input.style.display = "none";
    input.addEventListener("change", () => {
      const files = input.files ? Array.from(input.files) : [];
      if (files.length) this.handleUpload(files);
      input.value = "";
    });

    zone.addEventListener("click", () => input.click());
    zone.appendChild(input);
    return zone;
  }

  private async handleUpload(selected: File[]): Promise<void> {
    if (!this.wrapper) return;

    // `accept` no frena arrastrar/pegar ni "todos los archivos": se valida acá.
    const files = selected.filter(isAllowedImageFile);
    if (files.length < selected.length) {
      this.config.onUploadError?.(INVALID_IMAGE_FORMAT_MESSAGE);
    }
    if (files.length === 0) return;

    // Zona de carga temporal mientras suben los archivos.
    const loading = document.createElement("div");
    loading.style.cssText =
      "padding:20px;text-align:center;font-size:14px;color:#71717a;";
    loading.textContent =
      files.length > 1 ? `Subiendo ${files.length} fotos...` : "Subiendo...";
    this.wrapper.appendChild(loading);

    try {
      const results = await Promise.all(
        files.map((file) => this.config.uploader(file))
      );
      const uploaded = results.filter(
        (r): r is PhotoGridImage => !!r?.url && !!r?.key
      );
      if (uploaded.length === 0) throw new Error("Subida sin resultado");
      this.data.images = [...this.data.images, ...uploaded];
      if (uploaded.length < files.length) {
        this.config.onUploadError?.(
          "Algunas fotos no se pudieron subir. Intentá de nuevo."
        );
      }
    } catch (error) {
      this.config.onUploadError?.(
        "No se pudieron subir las fotos. Intentá de nuevo."
      );
    } finally {
      this.renderContent();
    }
  }

  private removeImage(index: number): void {
    const [removed] = this.data.images.splice(index, 1);
    if (removed) this.config.onRemoveImage?.(removed);
    this.renderContent();
  }

  /**
   * "Block tunes": botones en el menú de ajustes del bloque para elegir la
   * cantidad de columnas (2 o 3).
   */
  renderSettings(): MenuConfig {
    const columnsOptions: Array<{ value: 2 | 3; label: string; icon: string }> =
      [
        {
          value: 2,
          label: "2 columnas",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="7" height="16" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="14" y="4" width="7" height="16" rx="1.5" stroke="currentColor" stroke-width="1.8"/></svg>',
        },
        {
          value: 3,
          label: "3 columnas",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="5" height="16" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="9.5" y="4" width="5" height="16" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="17" y="4" width="5" height="16" rx="1.5" stroke="currentColor" stroke-width="1.8"/></svg>',
        },
      ];

    return columnsOptions.map((option) => ({
      icon: option.icon,
      title: option.label,
      onActivate: () => {
        this.data.columns = option.value;
        this.renderContent();
      },
      isActive: this.data.columns === option.value,
      closeOnActivate: true,
    }));
  }

  save(): PhotoGridData {
    return this.data;
  }

  validate(savedData: PhotoGridData): boolean {
    return Array.isArray(savedData.images) && savedData.images.length > 0;
  }
}
