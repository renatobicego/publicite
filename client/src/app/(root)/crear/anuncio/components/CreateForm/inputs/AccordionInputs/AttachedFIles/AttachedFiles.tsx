import SecondaryButton from "@/app/components/buttons/SecondaryButton";
import { AttachedFileValues, PostAttachedFile } from "@/types/postTypes";
import { Dispatch, SetStateAction, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import FileCard from "./FileCard";
import { FormikErrors } from "formik";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const AttachedFiles = ({
  attachedFiles,
  setAttachedFiles,
  errors,
}: {
  attachedFiles: AttachedFileValues[];
  setAttachedFiles: Dispatch<SetStateAction<AttachedFileValues[]>>;
  errors: string | string[] | FormikErrors<PostAttachedFile>[] | undefined;
}) => {
  const [error, setError] = useState<string | null>(null);

  const addFile = () => {
    setAttachedFiles((prev) => [
      ...prev,
      {
        file: null,
        label: "",
        _id: Math.random().toString(),
      },
    ]);
  };

  const handleFileChange = (file: File | null, _id: string) => {
    if (file) {
      // Validation: Check if the file is a PDF and its size is below 10MB
      if (file.type !== "application/pdf") {
        setError("Solo se permiten archivos PDF.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("El archivo no debe exceder los 10MB.");
        return;
      }

      // Clear the error if valid
      setError(null);

      // Update the attached file
      setAttachedFiles((prev) =>
        prev.map((f) => (f._id === _id ? { ...f, file } : f))
      );
    }
  };

  const handleLabelChange = (label: string, _id: string) => {
    setAttachedFiles((prev) =>
      prev.map((f) => (f._id === _id ? { ...f, label } : f))
    );
  };

  const removeFile = (_id: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file._id !== _id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 w-full justify-between flex-col items-end">
        <p className="text-text-color w-full text-xs md:text-sm">
          Agregue archivos .pdf adjuntos con una etiqueta. Tamaño máximo de
          10MB y 3 archivos.
        </p>
        <SecondaryButton
          startContent={<FaPlus className="max-size-8" />}
          size="sm"
          className="text-xs min-w-fit [&>svg]:min-w-3"
          isDisabled={attachedFiles.length >= 3}
          onPress={addFile}
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
            typeof errors === "object" && errors[index] && typeof errors[index] !== "string"
              ? errors[index] // Pass specific file errors for this file
              : null
          }
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

export default AttachedFiles;
