import { Button } from "@nextui-org/react";
import { ProductionBehaviourType } from "@/types/productionTypes";
import { behaviourLabel } from "../productionBehaviour";
import { PRODUCTION_BEHAVIOUR_DESTINATION } from "@/utils/data/behaviourLabels";

/** Elección libre / agenda de un blog personal, igual que en Anuncios. */
const SelectProductionBehaviour = ({
  type,
  setType,
  isDisabled,
}: {
  type?: ProductionBehaviourType;
  setType: (type: ProductionBehaviourType) => void;
  isDisabled?: boolean;
}) => (
  <div id="production-behaviour" className="flex-col flex gap-1 justify-start">
    <h2 className="text-lg font-medium">¿Dónde se publica tu blog?</h2>
    <div className="flex gap-4 w-full">
      <Button
        variant={type === ProductionBehaviourType.libre ? "solid" : "flat"}
        color="primary"
        className="flex-1 h-20 text-center"
        isDisabled={isDisabled}
        onPress={() => setType(ProductionBehaviourType.libre)}
      >
        {behaviourLabel[ProductionBehaviourType.libre]}
      </Button>
      <Button
        variant={type === ProductionBehaviourType.agenda ? "solid" : "flat"}
        color="warning"
        className="flex-1 h-20 text-center"
        isDisabled={isDisabled}
        onPress={() => setType(ProductionBehaviourType.agenda)}
      >
        {behaviourLabel[ProductionBehaviourType.agenda]}
      </Button>
    </div>
    {type ? (
      <p className="text-sm rounded-lg bg-default-100 px-3 py-2">
        Se publica en: <strong>{PRODUCTION_BEHAVIOUR_DESTINATION[type]}</strong>
      </p>
    ) : (
      <aside className="text-sm">
        Los <em>blogs geolocalizados</em> son públicos y se ven en{" "}
        <strong>{PRODUCTION_BEHAVIOUR_DESTINATION.libre}</strong>, para quien
        esté dentro del alcance de su ubicación. Los{" "}
        <em>blogs de mi agenda</em> se ven en{" "}
        <strong>{PRODUCTION_BEHAVIOUR_DESTINATION.agenda}</strong>, sólo para tu
        agenda de contactos.
      </aside>
    )}
  </div>
);

export default SelectProductionBehaviour;
