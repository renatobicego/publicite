"use client";

import {
  useCallback,
  Dispatch,
  SetStateAction,
  HTMLAttributes,
  memo,
} from "react";
import Dropzone from "./Dropzone";
import FilePreview from "./FilePreview";
import { toastifyError } from "@/utils/functions/toastify";
import { FILE_URL } from "@/utils/data/urls";

interface UploadImagesProps {
  allowVideos?: boolean;
  type?: "good" | "service";
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  customClassname?: HTMLAttributes<HTMLDivElement>["className"];
  prevFilesCount?: number;
  isVideoUploaded?: boolean;
  prefillImageUrls?: string[];
}

const UploadImages = ({
  allowVideos = true,
  type,
  files,
  setFiles,
  customClassname,
  prevFilesCount = 0,
  isVideoUploaded = false,
  prefillImageUrls = [],
}: UploadImagesProps) => {
  const maxImageSize = 8 * 1024 * 1024; // 8MB for images
  const maxVideoSize = 32 * 1024 * 1024; // 32MB for videos
  const maxTotalFiles = 10 - prevFilesCount - prefillImageUrls.length;
  const maxVideoFiles = allowVideos ? (isVideoUploaded ? 0 : 1) : 0;

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const currentVideoCount = files.filter((file) =>
        file.type.startsWith("video/")
      ).length;
      const currentFileCount = files.length;

      const validFiles = acceptedFiles.filter((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!allowVideos && isVideo) {
          toastifyError("No se permiten videos.");
          return false;
        }

        if (allowVideos && isVideo && currentVideoCount >= maxVideoFiles) {
          toastifyError("Solo se permite un video.");
          return false;
        }

        if (currentFileCount + acceptedFiles.length > maxTotalFiles) {
          toastifyError(
            `Solo puedes subir un máximo de ${maxTotalFiles} archivos.`
          );
          return false;
        }

        if (isImage && file.size > maxImageSize) {
          toastifyError(
            `El archivo ${file.name} es demasiado grande. Las imágenes deben ser menores a 4MB.`
          );
          return false;
        }

        if (allowVideos && isVideo && file.size > maxVideoSize) {
          toastifyError(
            `El archivo ${file.name} es demasiado grande. Los videos deben ser menores a 32MB.`
          );
          return false;
        }

        return true;
      });

      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowVideos, files, maxTotalFiles, maxVideoFiles]
  );

  // Remove a specific file
  const removeFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div className={`w-full md:w-1/2 ${customClassname}`}>
      <Dropzone
        onDrop={onDrop}
        allowVideos={allowVideos}
        maxTotalFiles={maxTotalFiles}
        maxVideoSize={maxVideoSize}
        isDisabled={!type}
      />
      <div className="flex gap-4 mt-4 w-full flex-wrap max-md:flex-nowrap max-md:overflow-x-auto">
        {prefillImageUrls.map((imageKey, index) => (
          <div
            key={`prefill-${index}`}
            className="relative w-24 h-24 rounded-md overflow-hidden border border-primary shrink-0"
          >
            <img
              src={FILE_URL + imageKey}
              alt={`Imagen de valuación ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[10px] text-center py-0.5">
              Valuación
            </span>
          </div>
        ))}
        {files.map((file, index) => (
          <FilePreview
            key={file.name + index}
            file={file}
            removeFile={removeFile}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(UploadImages);
