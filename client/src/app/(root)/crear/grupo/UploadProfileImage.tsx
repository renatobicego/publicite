import { toastifyError } from "@/utils/functions/toastify";
import { Dispatch, memo, SetStateAction, useCallback } from "react";
import Dropzone from "./Dropzone";
import { Button, Image } from "@nextui-org/react";
import { IoClose } from "react-icons/io5";
import { Group } from "@/types/groupTypes";;
import { FormikErrors } from "formik";
import { FILE_URL } from "@/utils/data/urls";

const UploadProfileImage = ({
  setPhotoFile,
  photoFile,
  prevImage,
  setFieldValue,
}: {
  setPhotoFile: Dispatch<SetStateAction<File | undefined>>;
  photoFile?: File;
  prevImage?: string;
  setFieldValue?: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<Group>>;
}) => {
  const maxImageSize = 8 * 1024 * 1024; // 4MB for images
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
    setFieldValue?.("profilePhotoUrl", null);
  };

  return (
    <div className="w-auto md:w-1/2 mx-auto">
      {photoFile || prevImage ? (
        <div className="relative ">
          <Image
            src={prevImage ? FILE_URL + prevImage : photoFile && URL.createObjectURL(photoFile)}
            alt={photoFile?.name || "Imagen de perfil"}
            className="object-cover size-64 md:size-72 lg:size-96 rounded-full"
          />
          <Button
            size="sm"
            isIconOnly
            aria-label="Eliminar foto de perfil"
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

export default memo(UploadProfileImage);
