import { Button, Image } from "@nextui-org/react";
import { IoClose } from "react-icons/io5";

interface FilePreviewProps {
  file: File;
  removeFile: (fileName: string) => void;
}

const FilePreview = ({ file, removeFile }: FilePreviewProps) => {
  return (
    <div className="relative overflow-hidden min-w-20 md:min-w-24 lg:min-w-28 xl:min-w-32">
      {file.type.startsWith("video/") ? (
        <video
          src={URL.createObjectURL(file)}
          controls
          className="size-20 md:size-24 lg:size-28 xl:size-32 object-cover rounded-lg md:rounded-xl xl:rounded-2xl"
        />
      ) : (
        <Image
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="object-cover size-20 md:size-24 lg:size-28 xl:size-32  max-md:rounded-lg"
        />
      )}
      <Button
        size="sm"
        isIconOnly
        radius="full"
        aria-label={"Eliminar archivo " + file.name}
        color="danger"
        onClick={() => removeFile(file.name)}
        className="absolute top-1 right-1 z-10 max-md:size-6 max-md:min-w-6"
      >
        <IoClose className="size-4" />
      </Button>
    </div>
  );
};

export default FilePreview;
