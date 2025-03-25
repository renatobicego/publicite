import { PostAttachedFile } from "@/types/postTypes";
import { FormikHelpers } from "formik";

export const handleFileSubmission = async (
  deletedImages: string[],
  values: any,
  actions: FormikHelpers<any>,
  deleteFiles: (urls: string[]) => Promise<void>,
  prevAttachedFilesDeleted: PostAttachedFile[],
  submitFiles: (values: any, actions: FormikHelpers<any>) => Promise<any>
) => {
  // delete files
  await deleteFiles([
    ...deletedImages.map((url) =>
      url.includes("video") ? url.replace("video", "") : url
    ),
    ...prevAttachedFilesDeleted.map((file) => file.url),
  ]);

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
