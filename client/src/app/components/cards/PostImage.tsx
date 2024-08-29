"use client";
import { CardHeader, Image, Link } from "@nextui-org/react";
import SaveButton from "../buttons/SaveButton";
import { POSTS } from "@/types/urls";

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
    <CardHeader className="w-full pb-0">
      <Link href={`${POSTS}/${_id}`} className="w-full">
        <Image
          src={url}
          classNames={{
            wrapper: "!max-w-full w-full",
            img: "!max-w-full w-full object-cover",
          }}
          
          alt={`Imagen de portada de ${title}`}
          width={287}
          height={290}
        />
      </Link>
      <SaveButton saved={false} className="absolute top-4 right-4 z-10" />
    </CardHeader>
  );
};

export default PostImage;
