import { useState } from "react";
import { useUploadThing } from "../uploadThing";
import { toastifyError } from "../functions/toastify";
import { AttachedFileValues } from "@/types/postTypes";
import { FormikHelpers } from "formik";
import { deleteFilesService } from "@/app/server/uploadThing";
import imageCompression from "browser-image-compression";

const useUploadFiles = (
  files: File[],
  attachedFiles: AttachedFileValues[],
  isPetition?: boolean,
  isEditing?: boolean
) => {
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

  const submitFiles = async (values: any, actions: FormikHelpers<any>) => {
    if (isPetition && !attachedFiles.length) {
      return values;
    }
    if (!files.length && !isPetition && !isEditing) {
      actions.setFieldError(
        "imagesUrls",
        "Por favor agregue al menos una imagen"
      );
      return;
    }
    let isVideoBeingUploaded = false;
    // Combine both files and attachedFiles into a single array for upload
    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.type.startsWith("video/")) {
          isVideoBeingUploaded = true;
          return file;
        }
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 600,
          useWebWorker: true,
        };
        return await imageCompression(file, options);
      })
    );

    // Separate images and videos
    const images = compressedFiles.filter(
      (file) => !file.type.startsWith("video/")
    );
    const videos = compressedFiles.filter((file) =>
      file.type.startsWith("video/")
    );

    // Ensure videos are at the end
    const orderedCompressedFiles = [...images, ...videos];

    // Combine with attached files
    const combinedFiles = [
      ...orderedCompressedFiles,
      ...attachedFiles.map((file) => file.file),
    ];
    // Start the upload
    let res;
    if (combinedFiles.length > 0) {
      res = await startUpload(combinedFiles as File[]);
    }
    if ((!res || !res.length) && !isEditing) {
      return;
    }
    // Separate URLs based on the origin of files
    const uploadedFileUrls = res
      ? res.slice(0, files.length).map((upload) => upload.key)
      : [];
    const uploadedAttachedFileUrls = res
      ? res.slice(files.length).map((upload, index) => ({
          url: upload.key,
          label: attachedFiles[index].label,
        }))
      : [];

    // Append "video" to the last uploaded file if a video was uploaded
    if (isVideoBeingUploaded && uploadedFileUrls.length > 0) {
      uploadedFileUrls[uploadedFileUrls.length - 1] += "video";
    }

    // Assign URLs to their respective fields in the form values
    if (isEditing) {
      if (!isPetition) {
        values.imagesUrls = [...values.imagesUrls, ...uploadedFileUrls];
        values.attachedFiles = [
          ...values.attachedFiles,
          ...uploadedAttachedFileUrls,
        ];
      } else {
        values.attachedFiles = uploadedAttachedFileUrls;
      }
    } else {
      if (!isPetition) {
        values.imagesUrls = uploadedFileUrls;
      }
      values.attachedFiles = uploadedAttachedFileUrls;
    }
    return values;
  };

  const deleteFiles = async (urls: string[]) => {
    try {
      await deleteFilesService(urls);
    } catch (error) {
      toastifyError(
        "Error al eliminar los archivos anteriores. Por favor intenta de nuevo."
      );
    }
  };
  return {
    submitFiles,
    progress,
    deleteFiles,
  };
};

export default useUploadFiles;
