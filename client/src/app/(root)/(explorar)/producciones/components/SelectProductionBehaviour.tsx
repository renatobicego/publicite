import { Button } from "@nextui-org/react";
import { ProductionBehaviourType } from "@/types/productionTypes";
import { behaviourLabel } from "../productionBehaviour";

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
    <h2 className="text-lg font-medium">Comportamiento del Blog</h2>
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
    <aside className="text-sm">
      Seleccione si el comportamiento del blog es libre o agenda. Los{" "}
      <em>blogs libres</em> serán públicos y visibles por el alcance de la
      localización. Los <em>blogs de agenda</em> serán visibles solo para tu
      agenda de contactos.
    </aside>
  </div>
);

export default SelectProductionBehaviour;
