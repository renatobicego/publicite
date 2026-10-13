"use client";
import { useCallback, useRef, useState } from "react";
import { useUploadThing } from "@/utils/uploadThing";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { uploadFile } from "@/app/server/productionActions";
import { deleteFilesService } from "@/app/server/uploadThing";
import { isProductionActionError } from "@/utils/functions/productionErrorHandler";
import { ProductionFileType } from "@/types/productionTypes";
import { INVALID_IMAGE_FORMAT_MESSAGE } from "@/utils/functions/imageFormats";
import { detectProductionFileType } from "../../productionFiles";

export interface ProductionUploadProgress {
  current: number;
  total: number;
  /** Porcentaje del archivo en curso (un video puede tardar minutos). */
  percent: number;
}

/**
 * Subida de archivos a un blog. La comparten el botón "Subir archivos" y el
 * arrastre desde el escritorio, así que el avance es uno solo.
 */
const useProductionUpload = (productionId: string) => {
  // Avance de la subida en curso (se puede elegir más de un archivo a la vez).
  const [uploadProgress, setUploadProgress] =
    useState<ProductionUploadProgress | null>(null);

  // `startUpload` no lanza: avisa por `onUploadError` y resuelve `undefined`.
  const uploadError = useRef<string | null>(null);
  const { startUpload } = useUploadThing("productionFileUploader", {
    uploadProgressGranularity: "fine",
    onUploadProgress: (percent) =>
      setUploadProgress((progress) => progress && { ...progress, percent }),
    onUploadError: (e) => {
      uploadError.current =
        e.code === "TOO_LARGE" || e.message.includes("FileSizeMismatch")
          ? "El archivo supera el tamaño máximo permitido"
          : "No se pudo subir el archivo";
    },
  });

  /** Sube un archivo y lo registra en el blog. Devuelve el error, si hubo. */
  const uploadOne = async (
    file: File,
    parentId?: string
  ): Promise<string | null> => {
    const fileType = detectProductionFileType(file);
    if (!fileType) {
      return file.type.startsWith("image/")
        ? INVALID_IMAGE_FORMAT_MESSAGE
        : "Tipo de archivo no soportado";
    }

    uploadError.current = null;
    const rawKey = (await startUpload([file]))?.[0]?.key;
    if (!rawKey) return uploadError.current ?? "No se pudo subir el archivo";

    // Convención de Anuncios: al key de un video se le agrega "video".
    const key =
      fileType === ProductionFileType.video ? `${rawKey}video` : rawKey;
    const res = await uploadFile({
      productionId,
      parentId,
      fileType,
      key,
      // Tamaño real del archivo para el cupo de almacenamiento por usuario.
      sizeBytes: file.size,
      name: file.name,
    });
    if (isProductionActionError(res)) {
      // El backend rechazó (p. ej. sin espacio). El archivo ya se subió a
      // UploadThing, así que lo borramos para no dejar un huérfano que igual
      // ocuparía storage real. Se borra con el key REAL (sin el sufijo "video").
      deleteFilesService([rawKey]);
      return res.error;
    }
    return null;
  };

  const busy = useRef(false);

  /** Sube los archivos a la carpeta dada. Devuelve cuántos se subieron. */
  const uploadFiles = useCallback(
    async (files: File[], parentId?: string): Promise<number> => {
      if (files.length === 0) return 0;
      if (busy.current) {
        toastifyError("Esperá a que termine la subida en curso");
        return 0;
      }
      busy.current = true;
      let uploadedCount = 0;
      try {
        // De a uno: cada archivo valida su propio cupo en el backend, y si uno
        // falla los demás siguen.
        for (const [index, file] of files.entries()) {
          setUploadProgress({
            current: index + 1,
            total: files.length,
            percent: 0,
          });
          const error = await uploadOne(file, parentId);
          if (error) {
            toastifyError(files.length > 1 ? `${file.name}: ${error}` : error);
          } else {
            uploadedCount++;
          }
        }
        if (uploadedCount > 0) {
          toastifySuccess(
            uploadedCount === 1
              ? "Archivo subido"
              : `${uploadedCount} archivos subidos`
          );
        }
        return uploadedCount;
      } finally {
        busy.current = false;
        setUploadProgress(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productionId, startUpload]
  );

  return { uploadFiles, uploadProgress };
};

export default useProductionUpload;
