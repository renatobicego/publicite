import { useState } from "react";
import DataBox, { EditButton } from "../DataBox";
import { Button, Slider } from "@nextui-org/react";
import { useBackground } from "@/app/(root)/providers/backgroundProvider";
import { UserPreferences } from "@/types/userTypes";
import { FaX } from "react-icons/fa6";

const Background = ({
  userPreferences,
}: {
  userPreferences: UserPreferences;
}) => {
  const { gradientValue, setGradientValue, postGradientValue, resetValue } =
    useBackground();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      <menu className="flex gap-2 items-center">
        <EditButton
          isLoading={isLoading}
          text={isFormVisible ? "Guardar" : "Editar"}
          onPress={() => {
            if (isFormVisible) {
              setIsLoading(true);
              postGradientValue({
                ...userPreferences,
                backgroundColor: gradientValue as number,
              }).finally(() => {
                setIsLoading(false);
                setIsFormVisible(false);
              });
            } else setIsFormVisible(true);
          }}
        />
        {isFormVisible && (
          <Button
            color="danger"
            size="sm"
            radius="full"
            isIconOnly
            aria-label="Cancelar"
            variant="flat"
            onPress={() => {
              setIsFormVisible(false);
              resetValue();
            }}
          >
            <FaX />
          </Button>
        )}
      </menu>
    </DataBox>
  );
};

export default Background;
