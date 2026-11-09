import { PostBehaviourType } from "@/types/postTypes";
import { Button } from "@nextui-org/react";
import { FaLocationDot, FaUser } from "react-icons/fa6";
import {
  POST_BEHAVIOUR_DESTINATION,
  POST_BEHAVIOUR_LABEL,
} from "@/utils/data/behaviourLabels";

/**
 * Comportamiento del anuncio. "libre" es el nombre interno: al usuario se le
 * muestra "geolocalizado", con el lugar exacto donde se va a publicar.
 */
const SelectPostBehaviourType = ({
  type,
  setType,
  errorMessage,
}: {
  type?: PostBehaviourType;
  setType: (type: PostBehaviourType) => void;
  errorMessage?: string;
}) => {
  return (
    <div id="post-behaviour" className="flex-col flex gap-1 justify-start">
      <h2 className="text-lg font-medium">¿Dónde se publica tu anuncio?</h2>
      <div className="flex gap-4 w-full">
        <Button
          variant={type === "libre" ? "solid" : "flat"}
          color="primary"
          className="flex-1 h-auto min-h-20 py-3 flex-col gap-1 whitespace-normal text-center"
          onPress={() => setType("libre")}
          startContent={<FaLocationDot className="size-5" />}
        >
          <span className="font-semibold">{POST_BEHAVIOUR_LABEL.libre}</span>
          <span className="text-xs opacity-80">
            Público, para quien esté cerca
          </span>
        </Button>
        <Button
          variant={type === "agenda" ? "solid" : "flat"}
          color="warning"
          className="flex-1 h-auto min-h-20 py-3 flex-col gap-1 whitespace-normal text-center"
          onPress={() => setType("agenda")}
          startContent={<FaUser className="size-5" />}
        >
          <span className="font-semibold">{POST_BEHAVIOUR_LABEL.agenda}</span>
          <span className="text-xs opacity-80">Sólo tu agenda de contactos</span>
        </Button>
      </div>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {type ? (
        <p className="text-sm rounded-lg bg-default-100 px-3 py-2">
          Se publica en: <strong>{POST_BEHAVIOUR_DESTINATION[type]}</strong>
        </p>
      ) : (
        <aside className="text-sm">
          Los <em>anuncios geolocalizados</em> son públicos y se ven en{" "}
          <strong>{POST_BEHAVIOUR_DESTINATION.libre}</strong>, para quien esté
          dentro del alcance de su ubicación. Los <em>anuncios de agenda</em> se
          ven en <strong>{POST_BEHAVIOUR_DESTINATION.agenda}</strong>, sólo para
          tu agenda de contactos.
        </aside>
      )}
    </div>
  );
};
export default SelectPostBehaviourType;
