"use client";
import { CardHeader, Image, Link } from "@nextui-org/react";
import SaveButton from "../buttons/SaveButton";
import { POSTS } from "@/app/utils/urls";

const PostImage = ({
  url,
  title,
  _id,
}: {
  url: string;
  title: string;
  _id: ObjectId;
}) => {
  return (
    <CardHeader className="w-full pb-0 max-md:px-1 md:px-2 lg:px-3">
      <Link href={`${POSTS}/${_id}`} className="w-full">
        <Image
          src={url}
          classNames={{
            wrapper: "!max-w-full w-full max-md:max-h-[45vw] md:max-lg:max-h-[25vw]",
            img: "!max-w-full w-full object-cover max-md:max-h-[45vw] md:max-lg:max-h-[25vw]",
          }}
          
          alt={`Imagen de portada de ${title}`}
          width={287}
          height={290}
        />
      </Link>
      <SaveButton saved={false} className="absolute top-4 right-2 md:right-4 z-10 max-md:min-w-8 max-md:size-8" />
    </CardHeader>
  );
};

export default PostImage;
