import { toastifyError } from "@/utils/functions/toastify";
import { Dispatch, SetStateAction, useCallback } from "react";
import Dropzone from "./Dropzone";
import { Button, Image } from "@nextui-org/react";
import { IoClose } from "react-icons/io5";

const UploadProfileImage = ({
  setPhotoFile,
  photoFile,
}: {
  setPhotoFile: Dispatch<SetStateAction<File | undefined>>;
  photoFile?: File;
}) => {
  const maxImageSize = 4 * 1024 * 1024; // 4MB for images
  const maxTotalFiles = 1;

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > maxImageSize) {
          toastifyError(
            `El archivo ${file.name} es demasiado grande. Las imágenes deben ser menores a 4MB.`
          );
          return false;
        }
        return true;
      });

      setPhotoFile(validFiles[0]);
    },
    [maxImageSize, setPhotoFile]
  );

  // Remove a specific file
  const removeFile = () => {
    setPhotoFile(undefined);
  };

  return (
    <div className="w-auto md:w-1/2 mx-auto">
      {photoFile ? (
        <div className="relative ">
          <Image
            src={URL.createObjectURL(photoFile)}
            alt={photoFile.name}
            className="object-cover size-64 md:size-72 lg:size-96 rounded-full"
          />
          <Button
            size="sm"
            isIconOnly
            radius="full"
            color="danger"
            onPress={removeFile}
            className="absolute top-1 right-1 z-10"
          >
            <IoClose className="size-4" />
          </Button>
        </div>
      ) : (
        <Dropzone onDrop={onDrop} maxTotalFiles={maxTotalFiles} />
      )}
    </div>
  );
};

export default UploadProfileImage;
