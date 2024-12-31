import { FILE_URL } from "@/utils/data/urls";
import { toastifyError } from "@/utils/functions/toastify";
import { isVideo } from "@/utils/functions/utils";
import { Button, Image, Tooltip } from "@nextui-org/react";
import { Dispatch, memo, SetStateAction } from "react";
import { FaCheck, FaPlus } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

const ImagePreview = ({
  image,
  deletedImages,
  setDeletedImages,
  isMaxFileCountExceeded,
}: {
  image: string;
  deletedImages: string[];
  setDeletedImages: Dispatch<SetStateAction<string[]>>;
  isMaxFileCountExceeded: boolean;
}) => {
  const removeImage = (key: string) => {
    setDeletedImages([...deletedImages, key]);
  };
  const addBackImage = (key: string) => {
    if (isMaxFileCountExceeded) {
      toastifyError(
        "No se pueden agregar más imagenes. Elimine otro archivo para restaurar esta imagen."
      );
      return;
    }
    setDeletedImages(deletedImages.filter((image) => image !== key));
  };
  const isBeingDeleted = deletedImages.includes(image);
  return (
    <div
      className={`relative overflow-hidden min-w-20 md:min-w-24 lg:min-w-28 xl:min-w-32 ${
        isBeingDeleted ? "border border-danger rounded-2xl" : ""
      }`}
    >
      {isVideo(image) ? (
        <video
          src={FILE_URL + image}
          controls
          className={`object-cover size-20 md:size-24 lg:size-28 xl:size-32 rounded-lg md:rounded-xl xl:rounded-2xl ${
            isBeingDeleted ? "opacity-50" : ""
          }`}
        />
      ) : (
        <Image
          src={FILE_URL + image}
          alt={"imagen anterior"}
          className={`object-cover size-20 md:size-24 lg:size-28 xl:size-32 max-md:rounded-lg`}
          classNames={{
            wrapper: ` ${isBeingDeleted ? "opacity-50" : ""}`,
          }}
        />
      )}

      {isBeingDeleted ? (
        <Tooltip placement="bottom" content="Restaurar imagen">
          <Button
            size="sm"
            isIconOnly
            aria-label={"Restaurar imagen"}
            radius="full"
            color="secondary"
            onPress={() => addBackImage(image)}
            className="absolute top-1 right-1 z-10 max-md:size-6 max-md:min-w-6 "
          >
            <FaPlus className="size-4" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip placement="bottom" content="Eliminar imagen">
          <Button
            size="sm"
            isIconOnly
            aria-label={"Eliminar imagen"}
            radius="full"
            color="danger"
            onPress={() => removeImage(image)}
            className="absolute top-1 right-1 z-10 max-md:size-6 max-md:min-w-6"
          >
            <IoClose className="size-4" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default memo(ImagePreview);
