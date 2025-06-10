import { IoCloudUploadSharp } from "react-icons/io5";
import { useDropzone } from "react-dropzone";
import { toastifyError } from "@/utils/functions/toastify";

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  maxTotalFiles: number;
}

const Dropzone = ({ onDrop, maxTotalFiles }: DropzoneProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [], // Accepts both jpg and jpeg
    },
    maxSize: 8 * 1024 * 1024, // Use video max size if videos are allowed
    maxFiles: maxTotalFiles,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((fileRejection) => {
        if (
          fileRejection.errors.some((error) => error.code === "file-too-large")
        ) {
          toastifyError(
            `El archivo ${fileRejection.file.name} es demasiado grande.`
          );
        }
      });
    },
  });

  return (
    <div
      {...getRootProps()}
      className="size-64 md:size-72 lg:size-96 hover:cursor-pointer hover:scale-[1.02] transition-all rounded-full"
    >
      <input {...getInputProps()} />
      <div
        className={`flex items-center w-full h-full justify-center border-2 
      border-gray-300 border-dashed flex-col bg-fondo rounded-full`}
      >
        <IoCloudUploadSharp className="size-16 text-primary" />
        <p className="text-center text-primary font-semibold lg:text-lg">
          Subir foto de perfil del grupo
        </p>
        <p className="text-text-color font-semibold text-xs lg:text-sm text-center max-w-[80%]">
          Tamaño máximo de 8MB
        </p>
      </div>
    </div>
  );
};

export default Dropzone;
