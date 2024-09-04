import { Petition } from "@/types/postTypes";
import { CardBody, Chip } from "@nextui-org/react";
import React from "react";
import ServiceChip from "../chips/ServiceChip";

const PetitionCard = ({
  post,
  recommendation,
}: {
  post: Petition;
  recommendation: boolean;
}) => {
  const frequencyPrice = {
    Monthly: "mes",
    Weekly: "semana",
    Yearly: "año",
    Hourly: "hora",
  };
  const price = post.toPrice
    ? `De $${post.price} a $${post.toPrice}`
    : `$${post.price}`;
  const frequencyShown = post.frequencyPrice
    ? `por ${frequencyPrice[post.frequencyPrice]}`
    : "";
  return (
    <CardBody className="flex flex-col gap-2">
      <h6>{post.title}</h6>
      <div className="flex gap-1">
        <Chip className="border-petition" variant="bordered" size="sm">
          Necesidad
        </Chip>
        {post.petitionType === "Service" && <ServiceChip />}
      </div>
      {post.description && (
        <div className="text-light-text line-clamp-2 max-md:text-xs">{post.description}</div>
      )}
      <p className="text-light-text max-md:text-xs font-semibold">
        {price} {frequencyShown}
      </p>
    </CardBody>
  );
};

export default PetitionCard;
