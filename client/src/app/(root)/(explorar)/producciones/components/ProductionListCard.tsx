"use client";
import Link from "next/link";
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react";
import { FaStar, FaUsers } from "react-icons/fa";
import { ProductionResponse } from "@/types/productionTypes";
import { resolveProductionFileUrl } from "../productionMedia";
import { PRODUCTIONS } from "@/utils/data/urls";

/** Tarjeta de un blog en el listado /producciones y en destacadas. */
const ProductionListCard = ({
  production,
}: {
  production: ProductionResponse;
}) => {
  const ownerName =
    production.ownerInfo?.businessName ||
    production.ownerInfo?.alias ||
    [production.ownerInfo?.name, production.ownerInfo?.lastName]
      .filter(Boolean)
      .join(" ") ||
    production.ownerInfo?.username ||
    "";

  return (
    <Card
      as={Link}
      href={`${PRODUCTIONS}/${production._id}`}
      isPressable
      shadow="sm"
      className="w-full"
    >
      <CardBody className="p-0 overflow-hidden h-40 flex items-center justify-center bg-default-100">
        {production.headerPhotoKey ? (
          <Image
            removeWrapper
            alt={production.title}
            src={resolveProductionFileUrl(production.headerPhotoKey)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-default-400 text-sm">Sin portada</span>
        )}
      </CardBody>
      <CardFooter className="flex-col items-start gap-1">
        <span className="font-medium truncate w-full">{production.title}</span>
        {ownerName && (
          <span className="text-xs text-default-500 truncate w-full">
            {ownerName}
          </span>
        )}
        <div className="flex items-center gap-3 text-xs text-default-500">
          <span className="flex items-center gap-1">
            <FaUsers /> {production.fansCount}
          </span>
          {production.rating != null && (
            <span className="flex items-center gap-1">
              <FaStar className="text-warning" /> {production.rating.toFixed(1)}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductionListCard;
