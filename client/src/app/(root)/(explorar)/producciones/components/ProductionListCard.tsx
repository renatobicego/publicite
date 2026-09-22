"use client";
import Link from "next/link";
import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";
import { FaStar, FaUsers } from "react-icons/fa";
import { ProductionResponse } from "@/types/productionTypes";
import { resolveProductionFileUrl } from "../productionMedia";
import { PRODUCTIONS } from "@/utils/data/urls";

/**
 * Tarjeta de un blog en el listado /producciones y en destacadas.
 * Sigue el patrón visual de `PostCard` (Anuncios): header con imagen de
 * portada y body con título, dueño, descripción y métricas.
 */
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
      shadow="none"
      className="w-full gap-4 ease-in-out hover:shadow md:hover:shadow-md !transition-shadow duration-500 !opacity-100"
    >
      <CardHeader className="w-full pb-0 max-md:px-1 md:px-2 lg:px-3">
        <div className="w-full overflow-hidden rounded-lg bg-default-100 flex items-center justify-center max-md:max-h-[45vw] md:max-h-[25vw] lg:max-h-[22vw] xl:max-h-[17vw] 3xl:max-h-[14vw] aspect-[287/200]">
          {production.headerPhotoKey ? (
            <Image
              removeWrapper
              alt={`Portada de ${production.title}`}
              src={resolveProductionFileUrl(production.headerPhotoKey)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-default-400 text-sm">Sin portada</span>
          )}
        </div>
      </CardHeader>
      <CardBody className="pt-0 flex flex-col gap-1 max-md:px-1 md:px-2 lg:px-3 pb-6">
        <div className="flex gap-1 w-full justify-between items-start">
          <h6 className="line-clamp-1">{production.title}</h6>
          {production.rating != null && (
            <div className="flex gap-1 items-center text-light-text text-sm shrink-0">
              <FaStar className="size-3 md:size-4 text-warning" />
              <span>{production.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        {ownerName && (
          <p className="text-light-text text-xs lg:text-small 2xl:text-sm line-clamp-1">
            {ownerName}
          </p>
        )}
        {production.description && (
          <p className="text-light-text line-clamp-2 text-xs lg:text-small 2xl:text-sm">
            {production.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-light-text text-small lg:text-sm 2xl:text-base font-semibold">
          <span className="flex items-center gap-1">
            <FaUsers /> {production.fansCount}
          </span>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProductionListCard;
