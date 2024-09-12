import BWButton from "@/app/components/buttons/BWButton";
import { Dispatch, SetStateAction } from "react";

const FrequencyButtons = ({
  frequency,
  setFrequency,
  type,
}: {
  frequency: number;
  setFrequency: Dispatch<SetStateAction<number>>;
  type: "packs" | "suscripciones";
}) => {
  return (
    <div className="flex gap-2 items-center">
      <BWButton
        variant={frequency === 0 ? "solid" : "bordered"}
        blackOrWhite={frequency === 0 ? "black" : "white"}
        onClick={() => setFrequency(0)}
      >
        {type === "packs" ? "Por 1 Mes" : "Mensual"}
      </BWButton>
      <BWButton
        variant={frequency === 1 ? "solid" : "bordered"}
        blackOrWhite={frequency === 1 ? "black" : "white"}
        onClick={() => setFrequency(1)}
      >
        {type === "packs" ? "Por 3 meses" : "Anual"}
      </BWButton>
    </div>
  );
};

export default FrequencyButtons;
