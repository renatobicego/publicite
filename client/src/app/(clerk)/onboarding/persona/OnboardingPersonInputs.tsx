import {
  CustomDateInput,
  CustomInput,
  CustomSelect,
  CustomTextarea,
} from "@/components/inputs/CustomInputs";
import PlaceAutocomplete from "@/components/inputs/PlaceAutocomplete";
import { UserPersonFormValues } from "@/types/userTypes";
import { CalendarDate } from "@internationalized/date";
import { Field, FormikErrors } from "formik";

interface OnboardingPersonInputsProps {
  initialValues: UserPersonFormValues;
  errors: FormikErrors<UserPersonFormValues>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<UserPersonFormValues>>;
}

const OnboardingPersonInputs = ({
  initialValues,
  errors,
  setFieldValue,
}: OnboardingPersonInputsProps) => {
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
        as={CustomInput}
        name="contact.phone"
        label="Teléfono"
        aria-label="telefono"
        isInvalid={!!errors.contact?.phone}
        type="tel"
        errorMessage={errors.contact?.phone}
        placeholder="Ingrese su teléfono"
      />
      <Field
        as={PlaceAutocomplete}
        isRequired
        name="countryRegion"
        isInvalid={!!errors.countryRegion}
        errorMessage={errors.countryRegion}
        onSelectionChange={(value: string) => setFieldValue("countryRegion", value)}
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
      <Field
        as={CustomTextarea}
        name="description"
        label="Descripción (opcional)"
        aria-label="apellido"
        placeholder="Ingrese una descripción para su perfil"
      />
    </>
  );
};

export default OnboardingPersonInputs;
