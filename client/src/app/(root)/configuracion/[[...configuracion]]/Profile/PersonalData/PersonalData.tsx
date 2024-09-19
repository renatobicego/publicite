import { TbWorldPin } from "react-icons/tb";
import DataBox, { DataItem, EditButton } from "../../DataBox";
import AnimatedBox from "../../AnimatedBox";
import { useState } from "react";
import PersonalDataForm from "./PersonalDataForm";
import { EditPersonProfileProps } from "@/types/userTypes";
import { formatDate } from "@/app/utils/functions/dates";
import { genderItems } from "@/app/utils/data/selectData";

const PersonalData = ({ data }: { data?: EditPersonProfileProps }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const gender = genderItems.find((item) => item.value === data?.gender);
  return (
    <AnimatedBox
      isVisible={isFormVisible}
      className="flex-1"
      keyValue="personal-data"
    >
      {isFormVisible ? (
        <PersonalDataForm
          key={"formPersonalData"}
          setIsFormVisible={setIsFormVisible}
          data={data}
        />
      ) : (
        <div className="flex flex-col gap-4 mb-2.5 max-md:items-start">
          <DataBox className=" max-md:my-2.5" labelText="Fecha de Nacimiento">
            <DataItem>{data && formatDate(data?.birthDate)}</DataItem>
            <EditButton text="Editar" onPress={() => setIsFormVisible(true)} />
          </DataBox>
          <DataBox labelText="Género" className="-mt-2.5">
            <DataItem>{gender?.name}</DataItem>
          </DataBox>
          <DataBox labelText="Ubicación">
            <DataItem Icon={<TbWorldPin className="size-4" />}>
              {data?.countryRegion}
            </DataItem>
          </DataBox>
        </div>
      )}
    </AnimatedBox>
  );
};

export default PersonalData;
