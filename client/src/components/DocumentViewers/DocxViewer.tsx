"use client";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@nextui-org/react";
import { FaFileWord } from "react-icons/fa";
import { DocumentLinks } from "./PdfViewer";

// Sólo enlaces web o de correo: un .docx puede traer `javascript:` en un link.
const SAFE_HREF = /^(https?:|mailto:|#)/i;

/**
 * Las páginas tienen el ancho real del documento (≈ A4): en pantallas
 * angostas se achican para que entren sin desplazamiento horizontal.
 */
const fitToWidth = (
  viewport: HTMLElement | null,
  body: HTMLElement | null
) => {
  const page = body?.querySelector<HTMLElement>("section.docx");
  if (!viewport || !body || !page) return;
  body.style.zoom = "";
  const scale = Math.min(1, (viewport.clientWidth - 16) / page.offsetWidth);
  if (scale < 1) body.style.zoom = String(scale);
};

/**
 * Visor de documentos de Word (.docx) en el navegador, con docx-preview: el
 * archivo se lee y se dibuja acá mismo, sin mandarlo a un servicio externo.
 * Los formatos viejos (.doc) y los de OpenDocument no se pueden leer: para
 * esos (o si falla) se ofrece descargar.
 */
const DocxViewer = ({ src, title }: { src: string; title: string }) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error(String(response.status));
        const blob = await response.blob();
        const { renderAsync } = await import("docx-preview");
        if (cancelled || !bodyRef.current) return;
        await renderAsync(blob, bodyRef.current, styleRef.current ?? undefined, {
          className: "docx",
          inWrapper: true,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          useBase64URL: true,
          // Los "altChunks" son HTML embebido que se mostraría en un iframe
          // con el mismo origen que la app: no se renderizan.
          renderAltChunks: false,
          renderComments: false,
          renderChanges: false,
        });
        bodyRef.current.querySelectorAll("a").forEach((link) => {
          const href = link.getAttribute("href") ?? "";
          if (!SAFE_HREF.test(href)) {
            link.removeAttribute("href");
            return;
          }
          if (!href.startsWith("#")) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
          }
        });
        fitToWidth(viewportRef.current, bodyRef.current);
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (status !== "ready") return;
    const onResize = () => fitToWidth(viewportRef.current, bodyRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [status]);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border p-8">
        <FaFileWord className="text-5xl text-primary" />
        <p className="text-sm text-center">
          No se pudo mostrar la vista previa de este documento.
        </p>
        <p className="text-sm text-center break-all">{title}</p>
        <DocumentLinks src={src} title={title} />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-xl border border-default-200 bg-default-100">
      <div className="flex items-center justify-between gap-2 border-b border-default-200 bg-content1 px-3 py-2">
        <span className="flex items-center gap-2 text-xs text-default-500">
          <FaFileWord className="text-primary" />
          Vista previa
        </span>
        <DocumentLinks src={src} title={title} compact />
      </div>
      <div ref={viewportRef} className="max-h-[80vh] overflow-auto">
        {status === "loading" && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}
        <div ref={styleRef} />
        <div ref={bodyRef} />
      </div>
    </div>
  );
};

export default DocxViewer;
