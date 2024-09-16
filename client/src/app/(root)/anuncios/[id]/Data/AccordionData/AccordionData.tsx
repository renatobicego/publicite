"use client";
import { Good, Service } from "@/types/postTypes";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { FaChevronLeft } from "react-icons/fa6";
import AdditionalGoodData from "./AdditionalGoodData";
import UserData from "./UserData";
import LocationMap from "./LocationMap";
import Reviews from "./Reviews";
import AttachedFiles from "./AttachedFiles";

const AccordionData = ({ post }: { post: Good | Service }) => {
  return (
    <Accordion
      itemClasses={{
        title: "text-text-color font-semibold max-md:text-sm text-base",
      }}
    >
      <AccordionItem
        indicator={<FaChevronLeft className="size-3" />}
        key="dataAdicional"
        className={post.postType === "Good" ? "" : "hidden"}
        aria-label="datos adicionales"
        title="Datos Adicionales"
      >
        <AdditionalGoodData post={post as Good} />
      </AccordionItem>
      <AccordionItem
        indicator={<FaChevronLeft className="size-3" />}
        key="userData"
        aria-label="datos del vendedor"
        title="Información del Vendedor"
      >
        <UserData author={post.author} showContact={true} />
      </AccordionItem>
      <AccordionItem
        indicator={<FaChevronLeft className="size-3" />}
        key="location"
        aria-label="ubicación"
        title="Ubicación"
      >
        <LocationMap lat={post.location.lat} lng={post.location.lng} />
      </AccordionItem>
      <AccordionItem
        indicator={<FaChevronLeft className="size-3" />}
        key="reviews"
        aria-label="opiniones"
        title="Opiniones"
      >
        {post.reviews.length === 0 ? (
          <Reviews reviews={post.reviews} />
        ) : (
          <p className="text-light-text text-sm">
            Nadie ha calificado este anuncio ¡Sé el primero!
          </p>
        )}
      </AccordionItem>
      <AccordionItem
        indicator={<FaChevronLeft className="size-3" />}
        key="attachedFiles"
        className={post.attachedFiles.length > 0 ? "" : "hidden"}
        aria-label="archivos adjuntos"
        title="Archivos Adjuntos"
      >
        <AttachedFiles attachedFiles={post.attachedFiles} />
      </AccordionItem>
    </Accordion>
  );
};

export default AccordionData;
