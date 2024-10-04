import { useState } from "react";
import { useUploadThing } from "../uploadThing";
import { toastifyError } from "../functions/toastify";
import { AttachedFileValues } from "@/types/postTypes";
import { FormikHelpers } from "formik";
import { image } from "@nextui-org/react";

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
      }));

    // Assign URLs to their respective fields in the form values
    if (isEditing) {
      values.imagesUrls = [...values.imagesUrls, ...uploadedFileUrls];
      values.attachedFiles = [
        ...values.attachedFiles,
        ...uploadedAttachedFileUrls,
      ];
    } else {
      values.imagesUrls = uploadedFileUrls;
      values.attachedFiles = uploadedAttachedFileUrls;
    }
    return values;
  };
  return {
    submitFiles,
    progress,
  };
};

export default useUploadFiles;
