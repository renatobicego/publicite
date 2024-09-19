import { useState } from "react";
import { useUploadThing } from "../uploadThing";
import { toastifyError } from "../functions/toastify";
import {
  AttachedFileValues,
  GoodPostValues,
  ServicePostValues,
} from "@/types/postTypes";
import { FormikHelpers } from "formik";

const useUploadFiles = (
  files: File[],
  attachedFiles: AttachedFileValues[]
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

  const submitFiles = async (values: GoodPostValues | ServicePostValues, actions: FormikHelpers<GoodPostValues>) => {
    if (!files.length) {
      actions.setFieldError(
        "imagesUrls",
        "Por favor agregue al menos una imagen"
      );
      return;
    }
    // Combine both files and attachedFiles into a single array for upload
    const combinedFiles = [...files, ...attachedFiles.map((file) => file.file)];

    const res = await startUpload(combinedFiles as File[]);
    if (!res || !res.length) {
      return;
    }

    // Separate URLs based on the origin of files
    const uploadedFileUrls = res
      .slice(0, files.length)
      .map((upload) => upload.url);
    const uploadedAttachedFileUrls = res
      .slice(files.length)
      .map((upload, index) => ({
        url: upload.url,
        label: attachedFiles[index].label,
        _id: "",
      }));

    // Assign URLs to their respective fields in the form values
    values.imagesUrls = uploadedFileUrls;
    values.attachedFiles = uploadedAttachedFileUrls;
    return values;
  };
  return {
    submitFiles,
    progress,
  };
};

export default useUploadFiles;
