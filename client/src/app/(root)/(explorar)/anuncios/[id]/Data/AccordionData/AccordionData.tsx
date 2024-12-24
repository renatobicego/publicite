"use client";
import { Good, Petition, Service } from "@/types/postTypes";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { FaChevronLeft } from "react-icons/fa6";
import AdditionalGoodData from "./AdditionalGoodData";
import UserData from "./UserData";
import LocationMap from "./LocationMap";
import Reviews from "./Reviews";
import AttachedFiles from "./AttachedFiles";

const AccordionData = ({
  post,
  isPetition,
}: {
  post: Good | Service | Petition;
  isPetition: boolean;
}) => {
  const accordionItems = [];

  // Conditionally add "Datos Adicionales" for Good type posts
  if (post.postType === "good") {
    accordionItems.push(
      <AccordionItem HeadingComponent={"h6"}
        indicator={<FaChevronLeft className="size-3" />}
        key="dataAdicional"
        aria-label="datos adicionales"
        title="Datos Adicionales"
      >
        <AdditionalGoodData post={post as Good} />
      </AccordionItem>
    );
  }

  // Add "Información del Vendedor" for all post types
  accordionItems.push(
    <AccordionItem HeadingComponent={"h6"}
      indicator={<FaChevronLeft className="size-3" />}
      key="userData"
      aria-label="datos del vendedor"
      title="Información del Vendedor"
    >
      <UserData author={post.author} showContact={true} />
    </AccordionItem>
  );

  // Add "Ubicación" if the post has location data
  if (post.geoLocation) {
    accordionItems.push(
      <AccordionItem HeadingComponent={"h6"}
        indicator={<FaChevronLeft className="size-3" />}
        key="location"
        aria-label="ubicación"
        title="Ubicación"
      >
        <LocationMap lat={post.geoLocation.location.coordinates[0]} lng={post.geoLocation.location.coordinates[1]} />
        {post.geoLocation.userSetted && (
          <p className="text-sm">
            El usuario vendedor ha establecido la ubicación manualmente
          </p>
        )}
      </AccordionItem>
    );
  }

  // Conditionally add "Opiniones" for non-petition posts with reviews
  if (!isPetition) {
    accordionItems.push(
      <AccordionItem HeadingComponent={"h6"}
        indicator={<FaChevronLeft className="size-3" />}
        key="reviews"
        aria-label="opiniones"
        title="Opiniones"
      >
        {"reviews" in post && post.reviews.length > 0 ? (
          <Reviews
            // reviews={post.reviews}
            reviews={[]}
          />
        ) : (
          <p className="text-light-text text-sm">
            Nadie ha calificado este anuncio ¡Sé el primero!
          </p>
        )}
      </AccordionItem>
    );
  }

  // Conditionally add "Archivos Adjuntos" if there are attached files
  if (post.attachedFiles.length > 0) {
    accordionItems.push(
      <AccordionItem HeadingComponent={"h6"}
        indicator={<FaChevronLeft className="size-3" />}
        key="attachedFiles"
        aria-label="archivos adjuntos"
        title="Archivos Adjuntos"
      >
        <AttachedFiles attachedFiles={post.attachedFiles} />
      </AccordionItem>
    );
  }

  return (
    <Accordion
      itemClasses={{
        title: "text-text-color font-semibold max-md:text-sm text-base",
      }}
    >
      {accordionItems}
    </Accordion>
  );
};

export default AccordionData;
