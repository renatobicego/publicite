"use client";
import { FILE_URL } from "@/utils/data/urls";
import { isVideo } from "@/utils/functions/utils";
import { Image } from "@nextui-org/react";
import { useState } from "react";

const Images = ({ images, title }: { images: string[]; title: string }) => {
  const [activeImage, setActiveImage] = useState(0);
  return (
    <div
      className="flex-1 flex flex-col md:max-lg:flex-row md:max-lg:justify-between
       gap-2 w-full lg:max-w-[50%] lg:sticky top-24 left-0 h-full overflow-y-auto"
    >
      {isVideo(images[activeImage], true) ? (
        <video
          src={FILE_URL + images[activeImage].replace("video", "")}
          controls
          className={`h-[40vh] lg:h-[60vh] border border-primary shadow md:max-lg:w-4/5 `}
        />
      ) : (
        <Image
          src={FILE_URL + images[activeImage]}
          width="100%"
          height="100%"
          alt={"Foto seleccionada de " + title}
          classNames={{
            wrapper:
              "h-[40vh] lg:h-[60vh] border border-primary shadow md:max-lg:w-4/5",
          }}
          className="w-full h-max object-contain"
        />
      )}
      <div className="w-full md:max-lg:w-fit max-md:overflow-x-auto md:max-lg:overflow-y-auto lg:overflow-x-auto flex gap-1 p-1 md:max-lg:flex-col">
        {images.map((image, index) => {
          return isVideo(image, true) ? (
            <video
              key={index}
              src={FILE_URL + image.replace("video", "")}
              onClick={() => setActiveImage(index)}
              className="h-20 w-24 md:h-24 md:w-32 xl:h-32 xl:w-40 object-cover shrink-0 hover:cursor-pointer"
            />
          ) : (
            <Image
              key={index}
              src={FILE_URL + image}
              onClick={() => setActiveImage(index)}
              alt={"Foto de " + title + " número " + (index + 1)}
              isZoomed
              classNames={{
                wrapper: `shrink-0 hover:cursor-pointer`,
                img: `${
                  index === activeImage
                    ? "border border-primary border-2 p-0.5"
                    : ""
                }`,
              }}
              className="h-20 w-24 md:h-24 md:w-32 xl:h-32 xl:w-40 object-cover"
            />
          );
        })}
      </div>
    </div>
  );
};

export default Images;
