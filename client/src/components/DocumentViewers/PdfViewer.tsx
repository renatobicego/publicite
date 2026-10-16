"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Spinner } from "@nextui-org/react";
import {
  FaDownload,
  FaExternalLinkAlt,
  FaSearchMinus,
  FaSearchPlus,
} from "react-icons/fa";
import type { PDFDocumentProxy } from "pdfjs-dist";

const ZOOM_LEVELS = [0.75, 1, 1.25, 1.5, 2];
const DEFAULT_ZOOM_INDEX = 1;

/**
 * Visor de PDF con pdf.js: dibuja cada página en un canvas a medida que se
 * acerca a la pantalla. A diferencia del visor del navegador en un iframe,
 * funciona igual en celulares (Android no muestra PDFs embebidos). Si el
 * archivo no se puede leer, cae al iframe con el visor del navegador.
 */
const PdfViewer = ({ src, title }: { src: string; title: string }) => {
  const pagesRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const zoom = ZOOM_LEVELS[zoomIndex];

  // Carga del documento.
  useEffect(() => {
    let cancelled = false;
    let loaded: PDFDocumentProxy | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
        loaded = await pdfjs.getDocument({ url: src, isEvalSupported: false })
          .promise;
        if (cancelled) {
          loaded.destroy();
          return;
        }
        setPdf(loaded);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      loaded?.destroy();
    };
  }, [src]);

  // Páginas: un canvas por página, dibujado cuando entra en pantalla. Al
  // cambiar el zoom se vuelven a dibujar con la nueva resolución.
  useEffect(() => {
    const container = pagesRef.current;
    if (!pdf || !container) return;
    container.replaceChildren();
    const width = container.clientWidth * zoom;
    const ratio = window.devicePixelRatio || 1;
    const rendered = new Set<number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (!entry.isIntersecting) return;
          const canvas = entry.target as HTMLCanvasElement;
          const pageNumber = Number(canvas.dataset.page);
          if (rendered.has(pageNumber)) return;
          rendered.add(pageNumber);
          observer.unobserve(canvas);
          const page = await pdf.getPage(pageNumber);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({
            scale: (width / base.width) * ratio,
          });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext("2d");
          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
          }
        });
      },
      { root: null, rootMargin: "600px 0px" }
    );

    let cancelled = false;
    (async () => {
      // El alto de cada página se reserva antes de dibujarla, así la barra de
      // desplazamiento no salta.
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const canvas = document.createElement("canvas");
        canvas.dataset.page = String(pageNumber);
        canvas.setAttribute("aria-label", `Página ${pageNumber}`);
        canvas.style.width = `${width}px`;
        canvas.style.aspectRatio = `${base.width} / ${base.height}`;
        canvas.className = "mx-auto block bg-white shadow-md";
        container.appendChild(canvas);
        observer.observe(canvas);
      }
    })();

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [pdf, zoom]);

  if (status === "error") {
    return (
      <div className="flex w-full flex-col gap-2">
        <iframe title={title} className="h-[70vh] w-full rounded-lg" src={src} />
        <DocumentLinks src={src} title={title} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-xl border border-default-200 bg-default-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-default-200 bg-content1 px-3 py-2">
        <span className="text-xs text-default-500">
          {pdf
            ? `${pdf.numPages} ${pdf.numPages === 1 ? "página" : "páginas"}`
            : "Cargando…"}
        </span>
        <div className="flex items-center gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label="Alejar"
            title="Alejar"
            isDisabled={zoomIndex === 0}
            onPress={() => setZoomIndex((index) => index - 1)}
          >
            <FaSearchMinus />
          </Button>
          <span className="w-12 text-center text-xs text-default-600">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label="Acercar"
            title="Acercar"
            isDisabled={zoomIndex === ZOOM_LEVELS.length - 1}
            onPress={() => setZoomIndex((index) => index + 1)}
          >
            <FaSearchPlus />
          </Button>
          <DocumentLinks src={src} title={title} compact />
        </div>
      </div>
      <div className="relative max-h-[80vh] overflow-auto p-2 sm:p-4">
        {status === "loading" && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}
        <div ref={pagesRef} className="flex w-full flex-col gap-3" />
      </div>
    </div>
  );
};

/** Abrir en otra pestaña y descargar el archivo original. */
export const DocumentLinks = ({
  src,
  title,
  compact = false,
}: {
  src: string;
  title: string;
  compact?: boolean;
}) => (
  <div className={`flex items-center gap-1 ${compact ? "" : "justify-end"}`}>
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      title="Abrir en otra pestaña"
      aria-label="Abrir en otra pestaña"
      className="flex h-8 items-center gap-2 rounded-full px-3 text-xs text-default-700 hover:bg-default-100"
    >
      <FaExternalLinkAlt />
      {!compact && "Abrir"}
    </a>
    <a
      href={src}
      download={title}
      target="_blank"
      rel="noopener noreferrer"
      title="Descargar"
      aria-label="Descargar"
      className="flex h-8 items-center gap-2 rounded-full px-3 text-xs text-default-700 hover:bg-default-100"
    >
      <FaDownload />
      {!compact && "Descargar"}
    </a>
  </div>
);

export default PdfViewer;
