import { useState } from "react";
import DataBox, { DataItem, EditButton } from "../../DataBox";

import AnimatedBox from "../../AnimatedBox";
import DescriptionForm from "./DescriptionForm";

const Description = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <AnimatedBox isVisible={isFormVisible} className="flex-1" keyValue="descrip">
      {isFormVisible ? (
        <DescriptionForm key={"formDescription"} setIsFormVisible={setIsFormVisible} />
      ) : (
        <DataBox labelText="Descripción" className="my-2.5">
          <DataItem className="max-md:order-last">
            Esta es la descripción del usuario Renato Bicego en la plataforma
            publicité
          </DataItem>
          <EditButton
            text="Editar"
            onPress={() => {
              setIsFormVisible(true);
            }}
          />
        </DataBox>
      )}
    </AnimatedBox>
  );
};

export default Description;
