import { useState } from "react";
import AnimatedBox from "../AnimatedBox";
import DataBox, { DataItem, EditButton } from "../DataBox";
import { TbWorldPin } from "react-icons/tb";
import BusinessDataForm from "./BusinessDataForm";

const BusinessData = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <AnimatedBox
      isVisible={isFormVisible}
      className="flex-1"
      keyValue="bussiness-data"
    >
      {isFormVisible ? (
        <BusinessDataForm
          key={"formBusinessData"}
          setIsFormVisible={setIsFormVisible}
        />
      ) : (
        <div className="flex flex-col gap-4 mb-2.5 max-md:items-start">
          <DataBox className=" max-md:my-2.5" labelText="Nombre de la Empresa">
            <DataItem>Samsung</DataItem>
            <EditButton text="Editar" onPress={() => setIsFormVisible(true)} />
          </DataBox>
          <DataBox labelText="Rubro" className="-mt-2.5">
            <DataItem>Tecnología</DataItem>
          </DataBox>
          <DataBox labelText="Ubicación">
            <DataItem Icon={<TbWorldPin className="size-5" />}>
              Buenos Aires, Ciudad Autónoma de Buenos Aires, Argentina
            </DataItem>
          </DataBox>
        </div>
      )}
    </AnimatedBox>
  );
};

export default BusinessData;
