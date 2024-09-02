import { PersonalDataValues } from "./PersonalDataForm";
import { Field, FormikErrors } from "formik";
import {
  CustomDateInput,
  CustomSelect,
} from "@/app/components/inputs/CustomInputs";
import PlaceAutocomplete from "@/app/components/inputs/PlaceAutocomplete";
import { CalendarDate } from "@internationalized/date";
interface PersonalDataFormInputsProps {
  initialValues: PersonalDataValues;
  errors: FormikErrors<PersonalDataValues>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PersonalDataValues>>;
}
const FormInputs = ({
  initialValues,
  errors,
  setFieldValue,
}: PersonalDataFormInputsProps) => {
  const genderItems = [
    { name: "Masculino", value: "M" },
    { name: "Femenino", value: "F" },
    { name: "No Binario", value: "X" },
    { name: "Otro", value: "O" },
  ];
  return (
    <>
      <Field
        as={CustomDateInput}
        isRequired
        name="birthDate"
        label="Fecha de Nacimiento"
        aria-label="fecha de nacimiento"
        isInvalid={!!errors.birthDate}
        errorMessage={errors.birthDate}
        onChange={(value: CalendarDate) =>
          setFieldValue("birthDate", value ? value.toString() : "")
        }
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
      <Field
        as={CustomSelect}
        name="gender"
        isRequired
        label="Género"
        aria-label="genero"
        placeholder="Seleccione su género"
        items={genderItems}
        defaultSelectedKeys={[initialValues.gender]}
        isInvalid={!!errors.gender}
        errorMessage={errors.gender}
        getItemLabel={(item: { name: string; value: string }) => item.name}
        getItemTextValue={(item: { name: string; value: string }) => item.name}
        getItemValue={(item: { name: string; value: string }) => item.value}
      />
    </>
  );
};

export default FormInputs;
