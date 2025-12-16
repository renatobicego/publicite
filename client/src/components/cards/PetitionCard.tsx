import { Petition } from "@/types/postTypes";
import { Button, CardBody, Chip, Link } from "@nextui-org/react";
import React from "react";
import ServiceChip from "../chips/ServiceChip";
import { frequencyPriceItems } from "@/utils/data/selectData";
import { POSTS } from "@/utils/data/urls";
import { formatTotal } from "@/utils/functions/utils";
import ShareButton from "../buttons/ShareButton";
import { FaShareAlt } from "react-icons/fa";

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
    : post.price
    ? `$${post.price}`
    : null;
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
      className={`flex flex-col relative gap-2 ${
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
      {price && (
        <p className="text-light-text text-small lg:text-sm 2xl:text-base font-semibold">
          {price} {frequencyShown}
        </p>
      )}
      <ShareButton
        data={{ ...post, type: "post" }}
        shareType="post"
        customUrl={`${POSTS}/${post._id}`}
        customTitle={`Echa un vistazo a este post: ${post.title}`}
        ButtonAction={
          <Button
            isIconOnly
            aria-label="Compartir"
            variant="flat"
            color="secondary"
            radius="full"
            className="absolute bottom-2 right-2 md:right-3 z-10 min-w-8 size-8"
          >
            <FaShareAlt />
          </Button>
        }
      />
    </CardBody>
  );
};

export default PetitionCard;
