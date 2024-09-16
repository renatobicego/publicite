import { Image } from "@nextui-org/react";

const Images = ({ images }: { images: string[] }) => {
  return (
    <div className="flex-1 flex flex-col gap-2">
      <Image
        src={images[0]}
        width="100%"
        height="100%"
        alt="Anuncio"
        className="w-full h-full max-h-[60vh] object-cover"
      />
      <div className="w-full overflow-x-scroll flex gap-1">
        {[...images.slice(1), ...images].map((image, index) => (
          <Image
            key={index}
            src={image}
            alt="Anuncio"
            classNames={{
                wrapper: "shrink-0",
            }}
            className="h-32 w-40 object-cover"
          />
        ))}
      </div>
    </div>
  );
};

export default Images;
