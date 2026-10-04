import { MediaBlockTool } from "./mediaBlockTool";

/**
 * Bloque de video para Editor.js. Sube el archivo a UploadThing (vía el
 * `uploader` de la config) y muestra un reproductor nativo como preview
 * dentro del editor; el render final "lindo" (controles custom) lo hace
 * `BlockRenderer` fuera del editor.
 */
export class VideoBlockTool extends MediaBlockTool {
  static get toolbox() {
    return {
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M16 9l6-3v12l-6-3V9z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
      title: "Video",
    };
  }

  static get isReadOnlySupported(): boolean {
    return true;
  }

  protected get acceptMime(): string {
    return "video/*";
  }

  protected get placeholderIcon(): string {
    return "🎬";
  }

  protected get placeholderText(): string {
    return "Hacé clic para subir un video";
  }

  protected renderPreview(url: string): HTMLElement {
    const container = document.createElement("div");
    container.style.cssText = "padding:8px 0;";
    const video = document.createElement("video");
    video.controls = true;
    video.src = url;
    // Preview acotado dentro del editor para que un video vertical no ocupe
    // toda la pantalla; el render final usa `VideoPlayer`.
    video.style.width = "100%";
    video.style.maxHeight = "360px";
    video.style.borderRadius = "8px";
    video.style.background = "#000";
    container.appendChild(video);
    return container;
  }
}
