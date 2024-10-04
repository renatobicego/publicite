import { isVideo } from "@/utils/functions/utils";
import { Button, Image } from "@nextui-org/react";
import { Dispatch, memo, SetStateAction } from "react";
import { IoClose } from "react-icons/io5";

const ImagePreview = ({
  image,
  setFieldValue,
}: {
  image: string;
  setFieldValue: Dispatch<SetStateAction<string>>;
}) => {
  const removeImage = (name: string) => {};
  return (
    <div className="relative overflow-hidden min-w-32">
      {isVideo(image) ? (
        <video src={image} controls className="size-32 object-cover" />
      ) : (
        <Image
          src={image}
          alt={"imagen anterior"}
          className="object-cover size-32"
        />
      )}
      <Button
        size="sm"
        isIconOnly
        radius="full"
        color="danger"
        onClick={() => removeImage(image)}
        className="absolute top-1 right-1 z-10"
      >
        <IoClose className="size-4" />
      </Button>
    </div>
  );
};

export default memo(ImagePreview);
