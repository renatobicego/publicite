import { useState } from "react";
import { useUploadThing } from "../uploadThing";
import { toastifyError } from "../functions/toastify";
import { FormikHelpers } from "formik";

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
      const res = await startUpload([file]);
      if (!res || !res.length) {
        return;
      }
  
      // Separate URLs based on the origin of files
      const uploadedFileUrl = res[0].url;

      return uploadedFileUrl;
    };
    return {
      submitFiles,
      progress,
    };
}

export default useUploadImage