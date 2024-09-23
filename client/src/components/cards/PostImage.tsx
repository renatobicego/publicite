"use client";
import { CardHeader, Image, Link } from "@nextui-org/react";
import SaveButton from "../buttons/SaveButton";
import { POSTS } from "@/utils/data/urls";
import { Good, Post, Service } from "@/types/postTypes";

const PostImage = ({
  post,
  recommendation
}: {
  post: Good | Service
  recommendation: boolean
}) => {
  return (
    <CardHeader className="w-full pb-0 max-md:px-1 md:px-2 lg:px-3">
      <Link href={`${POSTS}/${post._id}`} className="w-full">
        <Image
          src={post.imagesUrls[0]}
          classNames={{
            wrapper: `!max-w-full w-full max-md:max-h-[45vw] md:max-lg:max-h-[25vw] `,
            img: `!max-w-full w-full object-cover max-md:max-h-[45vw] md:max-lg:max-h-[25vw] ${recommendation && "lg:max-2xl:max-h-[18vw]"}`,
          }}
          
          alt={`Imagen de portada de ${post.title}`}
          width={287}
          height={290}
        />
      </Link>
      <SaveButton post={post} saved={false} className="absolute top-4 right-2 md:right-4 z-10 max-md:min-w-8 max-md:size-8" />
    </CardHeader>
  );
};

export default PostImage;
