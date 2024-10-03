import SecondaryButton from "@/components/buttons/SecondaryButton";
import {
  AttachedFileValues,
  GoodPostValues,
  PostAttachedFile,
  ServicePostValues,
} from "@/types/postTypes";
import { Dispatch, memo, SetStateAction, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import FileCard from "./FileCard";
import { FormikErrors } from "formik";
import PrevAttachedFile from "./PrevAttachedFile";
import DeletedAttachedFile from "./DeletedAttachedFIle";
import { useAttachedFiles } from "./AttachedFilesContext";

const AttachedFiles = ({
  errors,
  maxFiles = 3,
  setValues,
  isEditing
}: {
  errors: string | string[] | FormikErrors<PostAttachedFile>[] | undefined;
  maxFiles?: number;
  setValues?: (
    values: SetStateAction<any>,
    shouldValidate?: boolean
  ) => Promise<any>;
  isEditing: boolean;
}) => {
  const {
    attachedFiles,
    prevAttachedFiles,
    prevAttachedFilesDeleted,
    addFile,
    removeFile,
    handleFileChange,
    handleLabelChange,
    error,
    addBackDeletedAttachedFile
  } = useAttachedFiles();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 w-full justify-between flex-col items-end">
        <p className="text-text-color w-full text-xs md:text-sm">
          Agregue archivos .pdf adjuntos con una etiqueta. Tamaño máximo de 10MB
          y {maxFiles} archivo/s.
        </p>
        <SecondaryButton
          startContent={<FaPlus className="max-size-8" />}
          size="sm"
          className="text-xs min-w-fit [&>svg]:min-w-3"
          isDisabled={attachedFiles.length >= maxFiles}
          onPress={() => addFile(maxFiles, isEditing)}
        >
          Agregar Archivo
        </SecondaryButton>
      </div>

      {/* Displaying attached files as cards */}
      {attachedFiles.map((attachedFile, index) => (
        <FileCard
          key={attachedFile._id}
          attachedFile={attachedFile}
          onFileChange={handleFileChange}
          onLabelChange={handleLabelChange}
          onRemove={removeFile}
          error={
            typeof errors === "object" &&
            errors[index] &&
            typeof errors[index] !== "string"
              ? errors[index] // Pass specific file errors for this file
              : null
          }
        />
      ))}
      {prevAttachedFiles?.map((attachedFile, index) => (
        <PrevAttachedFile
          key={attachedFile._id + "prev"}
          attachedFile={attachedFile}
          onLabelChange={handleLabelChange}
          onRemove={removeFile}
          error={
            typeof errors === "object" &&
            errors[index] &&
            typeof errors[index] !== "string"
              ? errors[index] // Pass specific file errors for this file
              : null
          }
        />
      ))}
      {prevAttachedFilesDeleted?.map((attachedFile) => (
        <DeletedAttachedFile
          key={attachedFile._id + "deleted"}
          attachedFile={attachedFile}
          addBackDeletedAttachedFile={addBackDeletedAttachedFile}
        />
      ))}

      {/* General Error message */}
      {typeof errors === "string" && (
        <p className="text-red-500 text-sm">{errors}</p>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default memo(AttachedFiles);
