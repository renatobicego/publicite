import { MediaBlockTool } from "./mediaBlockTool";

/**
 * Bloque de audio para Editor.js. Sube el archivo a UploadThing (vía el
 * `uploader` de la config) y muestra un reproductor nativo como preview
 * dentro del editor; el render final "lindo" (tarjeta + waveform) lo hace
 * `BlockRenderer` fuera del editor.
 */
export class AudioBlockTool extends MediaBlockTool {
  static get toolbox() {
    return {
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.8"/></svg>',
      title: "Audio",
    };
  }

  static get isReadOnlySupported(): boolean {
    return true;
  }

  protected get acceptMime(): string {
    return "audio/*";
  }

  protected get placeholderIcon(): string {
    return "🎵";
  }

  protected get placeholderText(): string {
    return "Hacé clic para subir un audio";
  }

  protected renderPreview(url: string): HTMLElement {
    const container = document.createElement("div");
    container.style.cssText = "padding:8px 0;";
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = url;
    audio.style.width = "100%";
    container.appendChild(audio);
    return container;
  }
}
