"use client";
import { Good, Petition, Service } from "@/types/postTypes";
import { Accordion, AccordionItem, Spinner } from "@nextui-org/react";
import { FaChevronLeft } from "react-icons/fa6";
import { lazy, Suspense } from "react";
const AdditionalGoodData = lazy(() => import("./AdditionalGoodData"));
const UserData = lazy(() => import("./UserData"));
const LocationMap = lazy(() => import("./LocationMap"));
const Reviews = lazy(() => import("./Reviews"));
const AttachedFiles = lazy(() => import("./AttachedFiles"));

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
      <AccordionItem
        HeadingComponent={"h6"}
        indicator={<FaChevronLeft className="size-3" />}
        key="dataAdicional"
        aria-label="datos adicionales"
        title="Datos Adicionales"
      >
        <Suspense fallback={<Spinner color="warning" />}>
          <AdditionalGoodData post={post as Good} />
        </Suspense>
      </AccordionItem>
    );
  }

  // Add "Información del Vendedor" for all post types
  accordionItems.push(
    <AccordionItem
      HeadingComponent={"h6"}
      indicator={<FaChevronLeft className="size-3" />}
      key="userData"
      aria-label="datos del vendedor"
      title="Información del Vendedor"
    >
      <Suspense fallback={<Spinner color="warning" />}>
        <UserData author={post.author} showContact={true} />
      </Suspense>
    </AccordionItem>
  );

  // Add "Ubicación" if the post has location data
  if (post.geoLocation) {
    accordionItems.push(
      <AccordionItem
        HeadingComponent={"h6"}
        indicator={<FaChevronLeft className="size-3" />}
        key="location"
        aria-label="ubicación"
        title="Ubicación"
      >
        <Suspense fallback={<Spinner color="warning" />}>
          <LocationMap
            lat={post.geoLocation.location.coordinates[1]}
            lng={post.geoLocation.location.coordinates[0]}
          />
        </Suspense>
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
      <AccordionItem
        HeadingComponent={"h6"}
        indicator={<FaChevronLeft className="size-3" />}
        key="reviews"
        aria-label="opiniones"
        id="opiniones"
        title="Opiniones"
      >
        {"reviews" in post && post.reviews.length > 0 ? (
          <Suspense fallback={<Spinner color="warning" />}>
            <Reviews reviews={post.reviews} />
          </Suspense>
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
      <AccordionItem
        HeadingComponent={"h6"}
        indicator={<FaChevronLeft className="size-3" />}
        key="attachedFiles"
        aria-label="archivos adjuntos"
        title="Archivos Adjuntos"
      >
        <Suspense fallback={<Spinner color="warning" />}>
          <AttachedFiles attachedFiles={post.attachedFiles} />
        </Suspense>
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
