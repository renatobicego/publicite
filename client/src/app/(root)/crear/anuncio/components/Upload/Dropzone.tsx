import { IoCloudUploadSharp } from "react-icons/io5";
import { useDropzone } from "react-dropzone";
import { toastifyError } from "@/utils/functions/toastify";

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  allowVideos: boolean;
  maxTotalFiles: number;
  maxVideoSize: number;
  isDisabled?: boolean;
}

const Dropzone = ({
  onDrop,
  allowVideos,
  maxTotalFiles,
  maxVideoSize,
  isDisabled,
}: DropzoneProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    disabled: isDisabled,
    accept: allowVideos
      ? {
          "image/png": [],
          "image/jpeg": [], // Accepts both jpg and jpeg

          "video/mp4": [],
          "video/quicktime": [], // "mov" format
          "video/webm": [],
        }
      : {
          "image/png": [],
          "image/jpeg": [], // Accepts both jpg and jpeg
        },
    maxSize: allowVideos ? maxVideoSize : 8 * 1024 * 1024, // Use video max size if videos are allowed
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
      <div
        className={`flex items-center w-full min-h-72 lg:min-h-80 xl:min-h-96 3xl:min-h-[450px] justify-center border-2 
      border-gray-300 border-dashed rounded-md flex-col bg-fondo
        ${isDisabled ? "opacity-50" : ""}
        `}
      >
        <IoCloudUploadSharp className="size-16 text-primary" />
        <p className="text-center text-primary font-semibold lg:text-lg">
          Elegir o arrastra aquí los archivos
        </p>
        <p className="text-text-color font-semibold text-xs lg:text-sm text-center max-w-[80%]">
          {allowVideos
            ? `Tamaño máximo de 8MB para imágenes y 32MB para videos. Máximo ${maxTotalFiles} archivos y únicamente se permite 1 video.`
            : `Tamaño máximo de 8MB, máximo ${maxTotalFiles} imágenes`}
        </p>
      </div>
    </div>
  );
};

export default Dropzone;
