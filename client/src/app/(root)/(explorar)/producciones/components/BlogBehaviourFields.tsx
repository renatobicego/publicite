import { Select, SelectItem } from "@nextui-org/react";
import PlacePicker from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/PlacePicker";
import {
  ProductionBehaviourType,
  ProductionVisibility,
} from "@/types/productionTypes";
import { PostLocationForm } from "@/types/postTypes";
import { behaviourVisibilities, locationFieldSetter } from "../productionBehaviour";
import { visibilityLabel } from "../productionVisibility";

/**
 * Campos que dependen del comportamiento del blog, como en el alta de un
 * anuncio: un blog libre elige ubicación + radio y si es público o para
 * registrados; uno de agenda elige qué parte de la agenda lo ve.
 */
const BlogBehaviourFields = ({
  behaviourType,
  visibility,
  setVisibility,
  location,
  setLocation,
  showLocationError,
  isDisabled,
}: {
  behaviourType: ProductionBehaviourType;
  visibility: ProductionVisibility;
  setVisibility: (visibility: ProductionVisibility) => void;
  location: PostLocationForm;
  setLocation: (update: (prev: PostLocationForm) => PostLocationForm) => void;
  showLocationError?: boolean;
  isDisabled?: boolean;
}) => {
  const isAgenda = behaviourType === ProductionBehaviourType.agenda;
  return (
    <div className="flex flex-col gap-4">
      <Select
        label={isAgenda ? "Visibilidad del Blog" : "Alcance del Blog"}
        description={
          isAgenda
            ? "¿Qué parte de tu agenda de contactos puede verlo?"
            : "¿Quién puede verlo dentro del radio de alcance?"
        }
        selectedKeys={[visibility]}
        disallowEmptySelection
        isDisabled={isDisabled}
        onChange={(e) =>
          e.target.value && setVisibility(e.target.value as ProductionVisibility)
        }
      >
        {behaviourVisibilities[behaviourType].map((option) => (
          <SelectItem key={option} value={option}>
            {visibilityLabel[option]}
          </SelectItem>
        ))}
      </Select>
      {!isAgenda && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Ubicación y radio de alcance</span>
          <PlacePicker
            location={location}
            setFieldValue={locationFieldSetter(setLocation)}
            error={showLocationError}
          />
        </div>
      )}
    </div>
  );
};

export default BlogBehaviourFields;
