import { FILE_URL } from "@/utils/data/urls";
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
    return (
      <Badge
        content={reaction}
        color="default"
        size="lg"
        className="z-50"
        aria-label={"reaccion a " + postTitle + " con " + reaction + " emoji"}
      >
        <Image
          className="object-cover w-20 h-16 rounded-md"
          src={FILE_URL + image}
          alt={"foto de anuncio " + postTitle}
        />
      </Badge>
    );
  }
  if (isPetition) {
    return <MdQuestionAnswer className="text-petition size-14" />;
  }

  return (
    <Image
      className="object-cover w-20 h-16 rounded-md"
      src={FILE_URL + image}
      alt={"foto de anuncio " + postTitle}
    />
  );
};

export default PostActivityImage;
