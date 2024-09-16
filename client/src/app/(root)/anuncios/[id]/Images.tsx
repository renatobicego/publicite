"use client";
import { Button, Image } from "@nextui-org/react";
import { useState } from "react";

const Images = ({ images }: { images: string[] }) => {
  const [activeImage, setActiveImage] = useState(0);
  return (
    <div className="flex-1 flex flex-col gap-2 max-w-[50%]">
      <Image
        src={images[activeImage]}
        width="100%"
        height="100%"
        alt="Anuncio"
        className="w-full h-full max-h-[60vh] object-cover"
      />
      <div className="w-full overflow-x-auto flex gap-1 p-1">
        {[...images, ...images].map((image, index) => (
          <Image
            key={index}
            src={image}
            onClick={() => setActiveImage(index)}
            alt="Anuncio"
            isZoomed
            classNames={{
              wrapper: `shrink-0 hover:cursor-pointer`,
              img: `${index === activeImage ? "border border-primary border-2 p-0.5" : ""}`,
            }}
            className="h-32 w-40 object-cover"
          />
        ))}
      </div>
    </div>
  );
};

export default Images;
