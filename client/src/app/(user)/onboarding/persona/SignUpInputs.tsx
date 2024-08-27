import {
  CustomDateInput,
  CustomInput,
  CustomSelect,
  CustomTextarea,
} from "@/app/components/inputs/CustomInputs";
import { UserPersonFormValues } from "@/types/userTypes";
import { CalendarDate } from "@internationalized/date";
import { Field, FormikErrors } from "formik";
import PlaceAutocomplete from "./PlaceAutocomplete";

interface SignUpInputsProps {
  initialValues: UserPersonFormValues;
  errors: FormikErrors<UserPersonFormValues>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<UserPersonFormValues>>;
}

const SignUpInputs = ({
  initialValues,
  errors,
  setFieldValue,
}: SignUpInputsProps) => {
  const genderItems = [
    { name: "Masculino", value: "M" },
    { name: "Femenino", value: "F" },
    { name: "No Binario", value: "X" },
    { name: "Otro", value: "O" },
  ];
  return (
    <>
      <Field
        as={CustomInput}
        name="name"
        label="Nombre"
        aria-label="nombre"
        isInvalid={!!errors.name}
        errorMessage={errors.name}
        placeholder="Ingrese su nombre"
        isRequired
      />
      <Field
        as={CustomInput}
        name="lastname"
        label="Apellido"
        aria-label="apellido"
        isInvalid={!!errors.lastname}
        isRequired
        errorMessage={errors.lastname}
        placeholder="Ingrese su apellido"
      />
      <Field
        as={CustomDateInput}
        isRequired
        name="birthDate"
        label="Fecha de Nacimiento"
        aria-label="fecha de nacimiento"
        isInvalid={!!errors.birthDate}
        errorMessage={errors.birthDate}
        onChange={(value: CalendarDate) =>
          setFieldValue("birthDate", value.toString())
        }
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
        label="Descripción"
        aria-label="apellido"
        placeholder="Ingrese una descripción para su perfil"
      />
    </>
  );
};

export default SignUpInputs;
