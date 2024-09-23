import { CustomSelect } from "@/components/inputs/CustomInputs";
import { petitionTypesItems } from "@/utils/data/selectData";
import { Field } from "formik";
import { memo } from "react";

const PetitionType = ({errors} : {errors: string | undefined}) => {
  return (
    <Field
      as={CustomSelect}
      name="petitionType"
      isRequired
      items={petitionTypesItems}
      getItemValue={(item: any) => item.value}
      getItemLabel={(item: any) => item.label}
      label="Tipo de Necesidad"
      placeholder="Seleccione el tipo de necesidad"
      aria-label="tipo de necesidad"
      isInvalid={!!errors}
      errorMessage={errors}
    />
  );
};

export default memo(PetitionType);
