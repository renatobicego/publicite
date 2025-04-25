import { useState } from "react";
import AnimatedBox from "../AnimatedBox";
import DataBox, { DataItem, EditButton } from "../DataBox";
import { TbWorldPin } from "react-icons/tb";
import BusinessDataForm from "./BusinessDataForm";
import { BusinessSector, EditBusinessProfileProps } from "@/types/userTypes";

const BusinessData = ({ data }: { data?: EditBusinessProfileProps }) => {
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
          data={data}
        />
      ) : (
        <div className="flex flex-col gap-4 mb-2.5 max-md:items-start">
          <DataBox className=" max-md:my-2.5" labelText="Nombre de la Empresa">
            <DataItem>{data?.businessName}</DataItem>
            <EditButton text="Editar" onPress={() => setIsFormVisible(true)} />
          </DataBox>
          <DataBox labelText="CUIT/DNI" className="-mt-2.5">
            <DataItem>{data?.dni}</DataItem>
          </DataBox>
          <DataBox labelText="Rubro" className="-mt-2.5">
            <DataItem>{(data?.sector as BusinessSector).label}</DataItem>
          </DataBox>
          <DataBox labelText="Ubicación">
            <DataItem Icon={<TbWorldPin className="size-5" />}>
              {data?.countryRegion}
            </DataItem>
          </DataBox>
        </div>
      )}
    </AnimatedBox>
  );
};

export default BusinessData;
