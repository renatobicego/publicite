import {
  CustomDateInput,
  CustomInput,
  CustomSelect,
  CustomTextarea,
} from "@/components/inputs/CustomInputs";
import PlaceAutocomplete from "@/components/inputs/PlaceAutocomplete";
import { UserPersonFormValues } from "@/types/userTypes";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { Field, FormikErrors } from "formik";
import { memo } from "react";

interface OnboardingPersonInputsProps {
  initialValues: UserPersonFormValues;
  errors: FormikErrors<UserPersonFormValues>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<UserPersonFormValues>>;
  setFieldError: (field: string, message: string | undefined) => void;
}

const OnboardingPersonInputs = ({
  initialValues,
  errors,
  setFieldValue,
  setFieldError,
}: OnboardingPersonInputsProps) => {
  const genderItems = [
    { name: "Masculino", value: "M" },
    { name: "Femenino", value: "F" },
    { name: "No Binario", value: "X" },
    { name: "Otro", value: "O" },
  ];
  const maxBirthdate = today(getLocalTimeZone()).subtract({ years: 18 });
  return (
    <>
      <Field
        as={CustomDateInput}
        isRequired
        maxValue={maxBirthdate}
        name="birthDate"
        label="Fecha de Nacimiento"
        description="Debe ser mayor de 18 años"
        aria-label="fecha de nacimiento"
        isInvalid={!!errors.birthDate}
        errorMessage={errors.birthDate}
        onChange={(value: CalendarDate) => {
          if (!value) return;
          if (value.compare(maxBirthdate) > 0) {
            setFieldError("birthDate", "Debe ser mayor de 18 años");
            return;
          }
          setFieldValue("birthDate", value ? value.toString() : "");
          setFieldError("birthDate", undefined);
        }}
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
      <Field
        as={CustomTextarea}
        name="description"
        label="Descripción (opcional)"
        aria-label="apellido"
        placeholder="Ingrese una descripción para su cartel de usuario"
      />
    </>
  );
};

export default memo(OnboardingPersonInputs);
