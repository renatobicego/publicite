import { useState } from "react";
import DataBox, { DataItem, EditButton } from "../../DataBox";

import AnimatedBox from "../../AnimatedBox";
import DescriptionForm from "./DescriptionForm";

const Description = ({ description }: { description?: string }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <AnimatedBox
      isVisible={isFormVisible}
      className="flex-1"
      keyValue="descrip"
    >
      {isFormVisible ? (
        <DescriptionForm
          key={"formDescription"}
          setIsFormVisible={setIsFormVisible}
          description={description}
          isBusiness
        />
      ) : (
        <DataBox labelText="Descripción" className="my-2.5">
          <DataItem className="max-md:order-last">{description}</DataItem>
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
