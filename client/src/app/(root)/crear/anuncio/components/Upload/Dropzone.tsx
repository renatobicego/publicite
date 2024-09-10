import { IoCloudUploadSharp } from "react-icons/io5";
import { useDropzone } from "react-dropzone";
import { toastifyError } from "@/app/utils/toastify";

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  allowVideos: boolean;
  maxTotalFiles: number;
  maxVideoSize: number;
}

const Dropzone = ({
  onDrop,
  allowVideos,
  maxTotalFiles,
  maxVideoSize,
}: DropzoneProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: allowVideos
      ? {
          "image/*": [], // Accept all image types
          "video/*": [], // Accept all video types
        }
      : {
          "image/*": [], // Only accept image types
        },
    maxSize: allowVideos ? maxVideoSize : 5 * 1024 * 1024, // Use video max size if videos are allowed
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
      className="w-full hover:cursor-pointer hover:scale-[1.02] transition-all"
    >
      <input {...getInputProps()} />
      <div className="flex items-center w-full min-h-96 justify-center border-2 border-gray-300 border-dashed rounded-md flex-col bg-fondo">
        <IoCloudUploadSharp className="size-16 text-primary" />
        <p className="text-center text-primary font-semibold text-lg">
          Elegir o arrastra aquí los archivos
        </p>
        <p className="text-text-color font-semibold text-sm text-center max-w-[80%]">
          {allowVideos
            ? "Tamaño máximo de 5Mb para imágenes y 30Mb para videos. Máximo 10 archivos y únicamente se permite 1 video."
            : "Tamaño máximo de 5Mb, máximo 10 imágenes"}
        </p>
      </div>
    </div>
  );
};

export default Dropzone;
