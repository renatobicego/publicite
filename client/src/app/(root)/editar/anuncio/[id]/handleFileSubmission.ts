import { PostAttachedFile } from "@/types/postTypes";
import { FormikHelpers } from "formik";

/** Keys de UploadThing de lo que el usuario quitó (sin el sufijo "video"). */
export const removedFileKeys = (
  deletedImages: string[],
  prevAttachedFilesDeleted: PostAttachedFile[]
) => [
  ...deletedImages.map((url) =>
    url.includes("video") ? url.replace("video", "") : url
  ),
  ...prevAttachedFilesDeleted.map((file) => file.url),
];

/**
 * Sube lo nuevo y arma los valores finales. Lo quitado NO se borra acá: se
 * borra recién cuando el server acepta la edición (si la rechaza, por ejemplo
 * por falta de espacio, el anuncio sigue usando esos archivos).
 */
export const handleFileSubmission = async (
  deletedImages: string[],
  values: any,
  actions: FormikHelpers<any>,
  prevAttachedFilesDeleted: PostAttachedFile[],
  submitFiles: (values: any, actions: FormikHelpers<any>) => Promise<any>
) => {
  // upload new files
  const newValuesWithUrlFiles = await submitFiles(values, actions);
  if (!newValuesWithUrlFiles) {
    actions.setSubmitting(false);
    return false;
  }
  // update values with new files urls and filtered deleted files
  values = {
    ...newValuesWithUrlFiles,
    imagesUrls: newValuesWithUrlFiles.imagesUrls.filter(
      (url: string) => !deletedImages.includes(url)
    ),
    attachedFiles: newValuesWithUrlFiles.attachedFiles.filter(
      (file: PostAttachedFile) =>
        !prevAttachedFilesDeleted.some(
          (deletedFile) => deletedFile.url === file.url
        )
    ),
  };

  return values;
};
