import { TbWorldPin } from "react-icons/tb";
import DataBox, { DataItem, EditButton } from "../../DataBox";
import AnimatedBox from "../../AnimatedBox";
import { useState } from "react";
import PersonalDataForm from "./PersonalDataForm";

const PersonalData = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <AnimatedBox isVisible={isFormVisible} className="flex-1">
      {isFormVisible ? (
        <PersonalDataForm key={"formPersonalData"} setIsFormVisible={setIsFormVisible} />
      ) : (
        <div className="flex flex-col gap-4 mb-2.5 max-md:items-start">
          <DataBox className=" max-md:my-2.5" labelText="Fecha de Nacimiento">
            <DataItem>03/04/2002</DataItem>
            <EditButton text="Editar" onPress={() => setIsFormVisible(true)} />
          </DataBox>
          <DataBox labelText="Género" className="-mt-2.5">
            <DataItem>M</DataItem>
          </DataBox>
          <DataBox labelText="Ubicación">
            <DataItem Icon={<TbWorldPin className="size-4" />}>
              Las Heras, Mendoza, Argentina
            </DataItem>
          </DataBox>
        </div>
      )}
    </AnimatedBox>
  );
};

export default PersonalData;
