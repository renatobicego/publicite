import { useState } from "react";
import DataBox, { DataItem, EditButton } from "../DataBox";
import { Slider } from "@nextui-org/react";
import { useBackground } from "@/app/(root)/backgroundProvider";

const Background = () => {
  const { gradientValue, setGradientValue } = useBackground();
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <DataBox className="max-md:my-2.5" labelText="Color de Fondo">
      <Slider
        label="Gradiente de naranja"
        step={1}
        maxValue={99}
        minValue={0}
        value={gradientValue}
        onChange={setGradientValue}
        hideValue
        isDisabled={!isFormVisible}
        className="flex-1"
      />
      <EditButton
        text={isFormVisible ? "Guardar" : "Editar"}
        onPress={() => setIsFormVisible(!isFormVisible)}
      />
    </DataBox>
  );
};

export default Background;
