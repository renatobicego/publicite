import { Field, FormikErrors } from "formik";
import {
  CustomInput,
  CustomSelect,
} from "@/app/components/inputs/CustomInputs";
import PlaceAutocomplete from "@/app/components/inputs/PlaceAutocomplete";
import { EditBusinessProfileProps } from "@/types/userTypes";
interface PersonalDataFormInputsProps {
  initialValues: EditBusinessProfileProps;
  errors: FormikErrors<EditBusinessProfileProps>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<EditBusinessProfileProps>>;
}
const FormInputs = ({
  initialValues,
  errors,
  setFieldValue,
}: PersonalDataFormInputsProps) => {
  const businessSectorItems = [
    { name: "Masculino", value: "M" },
    { name: "Femenino", value: "F" },
    { name: "No Binario", value: "X" },
    { name: "Otro", value: "O" },
  ];
  return (
    <>
      <Field
        as={CustomInput}
        isRequired
        name="businessName"
        label="Nombre de la Empresa - Negocio"
        aria-label="Ingrese el nombre"
        isInvalid={!!errors.businessName}
        errorMessage={errors.businessName}
      />
      <Field
        as={CustomSelect}
        name="businessSector"
        isRequired
        label="Género"
        aria-label="genero"
        placeholder="Seleccione su género"
        items={businessSectorItems}
        defaultSelectedKeys={[initialValues.businessSector]}
        isInvalid={!!errors.businessSector}
        errorMessage={errors.businessSector}
        getItemLabel={(item: { name: string; value: string }) => item.name}
        getItemTextValue={(item: { name: string; value: string }) => item.name}
        getItemValue={(item: { name: string; value: string }) => item.value}
      />
      <Field
        as={PlaceAutocomplete}
        isRequired
        name="countryRegion"
        isInvalid={!!errors.countryRegion}
        errorMessage={errors.countryRegion}
        onSelectionChange={(value: string) =>
          setFieldValue("countryRegion", value)
        }
      />
    </>
  );
};

export default FormInputs;
