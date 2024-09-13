import { Button, Image } from "@nextui-org/react";
import { IoClose } from "react-icons/io5";

interface FilePreviewProps {
  file: File;
  removeFile: (fileName: string) => void;
}

const FilePreview = ({ file, removeFile }: FilePreviewProps) => {
  return (
    <div key={file.name} className="relative overflow-hidden min-w-32">
      {file.type.startsWith("video/") ? (
        <video
          src={URL.createObjectURL(file)}
          controls
          className="size-32 object-cover"
        />
      ) : (
        <Image
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="object-cover size-32"
        />
      )}
      <Button
        size="sm"
        isIconOnly
        radius="full"
        color="danger"
        onClick={() => removeFile(file.name)}
        className="absolute top-1 right-1 z-10"
      >
        <IoClose className="size-4" />
      </Button>
    </div>
  );
};

export default FilePreview;
