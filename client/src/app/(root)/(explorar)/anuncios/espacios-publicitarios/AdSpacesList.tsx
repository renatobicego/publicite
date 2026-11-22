"use client";
import PostListLogic from "../components/PostListLogic";
import SelectManualLocationModal from "@/components/modals/SelectManualLocation/SelectManualLocationModal";
import { AdSpaceMedium } from "@/types/postTypes";
import { adSpaceMediumOf } from "@/utils/data/adSpaces";

/**
 * Listado de espacios publicitarios (todos o de un medio). Son anuncios
 * geolocalizados: se ven dentro del radio de publicación de cada uno.
 */
const AdSpacesList = ({ medium }: { medium?: AdSpaceMedium }) => {
  const info = adSpaceMediumOf(medium);
  return (
    <section className="w-full flex-col flex gap-4 items-start">
      <div className="flex flex-col gap-1">
        <h2>
          Espacios publicitarios{info ? ` - ${info.label}` : ""}
        </h2>
        <p className="text-sm text-default-600">
          Radios, canales, carteles, diarios, revistas e influencers que
          ofrecen su espacio. Soonpublicité te pone en contacto con el
          anunciante: la contratación y el pago se arreglan directamente con
          él.
        </p>
      </div>
      <SelectManualLocationModal showAlways />
      <PostListLogic
        postType={{
          typeOfData: "posts",
          postType: "adspace",
          adSpaceMedium: medium,
        }}
      />
    </section>
  );
};

export default AdSpacesList;
