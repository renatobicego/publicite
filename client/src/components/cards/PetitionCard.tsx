import { Petition } from "@/types/postTypes";
import { CardBody, Chip, Link } from "@nextui-org/react";
import React from "react";
import ServiceChip from "../chips/ServiceChip";
import { frequencyPriceItems } from "@/utils/data/selectData";
import { POSTS } from "@/utils/data/urls";
import { formatTotal } from "@/utils/functions/utils";

const PetitionCard = ({
  post,
  recommendation,
  isGroupPost,
}: {
  post: Petition;
  recommendation: boolean;
  isGroupPost: boolean;
}) => {
  const price = post.toPrice
    ? `De $${formatTotal(post.price)} a $${formatTotal(post.toPrice)}`
    : `$${post.price}`;
  const frequencyShown =
    post.frequencyPrice && (post.frequencyPrice as any) !== "undefined"
      ? `por ${
          frequencyPriceItems.find((item) => item.value === post.frequencyPrice)
            ?.text
        }`
      : "";
  return (
    <CardBody
      as={Link}
      href={`${POSTS}/${post._id}`}
      className={`flex flex-col gap-2 ${
        !isGroupPost && "pb-5"
      }  justify-start items-start`}
    >
      <h6 className="text-text-color">{post.title}</h6>
      <div className="flex gap-1">
        <Chip className="border-petition" variant="bordered" size="sm">
          Necesidad
        </Chip>
        {post.petitionType === "service" && <ServiceChip />}
      </div>
      {post.description && (
        <div className="text-light-text line-clamp-2 text-xs lg:text-small 2xl:text-sm">
          {post.description}
        </div>
      )}
      <p className="text-light-text text-small lg:text-sm 2xl:text-base font-semibold">
        {price} {frequencyShown}
      </p>
    </CardBody>
  );
};

export default PetitionCard;
