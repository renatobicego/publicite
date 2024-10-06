"use client";
import { FILE_URL } from "@/utils/data/urls";
import { Image } from "@nextui-org/react";
import { useState } from "react";

const Images = ({ images }: { images: string[] }) => {
  const [activeImage, setActiveImage] = useState(0);
  return (
    <div className="flex-1 flex flex-col gap-2 w-full md:max-w-[50%] md:sticky top-24 left-0 h-full overflow-y-auto">
      <Image
        src={FILE_URL + images[activeImage]}
        width="100%"
        height="100%"
        alt="Anuncio"
        className="w-full h-full max-h-[60vh] object-cover"
      />
      <div className="w-full overflow-x-auto flex gap-1 p-1">
        {[...images, ...images].map((image, index) => (
          <Image
            key={index}
            src={FILE_URL + image}
            onClick={() => setActiveImage(index)}
            alt="Anuncio"
            isZoomed
            classNames={{
              wrapper: `shrink-0 hover:cursor-pointer`,
              img: `${index === activeImage ? "border border-primary border-2 p-0.5" : ""}`,
            }}
            className="h-20 w-24 md:h-24 md:w-32 xl:h-32 xl:w-40 object-cover"
          />
        ))}
      </div>
    </div>
  );
};

export default Images;
