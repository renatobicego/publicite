import { Badge, Image } from "@nextui-org/react";
import React from "react";
import { MdQuestionAnswer } from "react-icons/md";

const PostActivityImage = ({
  isPetition,
  reaction,
  image,
  postTitle,
}: {
  isPetition: boolean;
  reaction?: string;
  image?: string;
  postTitle: string;
}) => {
  if (reaction) {
    <Badge content={reaction} color="primary">
      <Image
        className="object-cover w-16 h-16 rounded-md"
        src={image}
        alt={"foto de anuncio " + postTitle}
      />
    </Badge>;
  }
  if (isPetition) {
    return <MdQuestionAnswer className="text-petition size-14" />;
  }

  return (
    <Image
      className="object-cover w-16 h-16 rounded-md"
      src={image}
      alt={"foto de anuncio " + postTitle}
    />
  );
};

export default PostActivityImage;
