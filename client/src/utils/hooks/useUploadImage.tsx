import { useState } from "react";
import { useUploadThing } from "../uploadThing";
import { toastifyError } from "../functions/toastify";
import { deleteFilesService } from "@/app/server/uploadThing";
import imageCompression from "browser-image-compression";
const useUploadImage = () => {
  const [progress, setProgress] = useState(0);
  const { startUpload } = useUploadThing("fileUploader", {
    onUploadError: (e) => {
      toastifyError(`Error al subir el archivo/imagen: ${e.name}`);
    },
    onClientUploadComplete: () => {
      setProgress(0);
    },

    onUploadProgress: (value) => {
      setProgress(value);
    },
  });

  const submitFiles = async (file: File) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 600,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);
    const res = await startUpload([compressedFile]);
    if (!res || !res.length) {
      return;
    }
    // get the uploaded file key
    const uploadedFileUrl = res[0].key;

    return uploadedFileUrl;
  };

  const deleteFile = async (key: string) => {
    try {
      await deleteFilesService([key]);
    } catch (error) {
      toastifyError(
        "Error al eliminar el archivo anteriores. Por favor intenta de nuevo."
      );
    }
  };
  return {
    submitFiles,
    progress,
    deleteFile,
  };
};

export default useUploadImage;
