import { Field, FormikErrors } from "formik";
import { ChangeEvent, memo } from "react";
import {
  CustomInput,
  CustomSelect,
  CustomTextarea,
} from "@/components/inputs/CustomInputs";
import { visibilityItems } from "@/utils/data/selectData";
import SelectUsers from "@/components/inputs/SelectUsers";
import { mockedUsers } from "@/utils/data/mockedData";
import { Divider } from "@nextui-org/react";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { PostGroup } from "./CreateGroupForm";

const Inputs = ({
  errors,
  setFieldValue,
}: {
  errors: FormikErrors<PostGroup>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PostGroup>>;
}) => {
  return (
    <>
      <Field
        as={CustomInput}
        name="name"
        label="Nombre del grupo"
        placeholder="Agregue un nombre"
        isRequired
        aria-label="nombre"
        isInvalid={!!errors.name}
        errorMessage={errors.name}
      />
      <Field
        as={CustomTextarea}
        name="details"
        label="Descripción"
        placeholder="Agregue una descripción"
        description="Máximo 200 caracteres"
        aria-label="descripción"
        isInvalid={!!errors.details}
        errorMessage={errors.details}
      />
      <Field
        as={CustomTextarea}
        name="rules"
        label="Reglas"
        placeholder="Agregue las reglas del grupo"
        description="Máximo 200 caracteres"
        aria-label="reglas"
        isInvalid={!!errors.rules}
        errorMessage={errors.rules}
      />
      <Divider />
      <h6>Invitar Miembros *</h6>
      <Field
        as={SelectUsers}
        isRequired
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setFieldValue("members", e.target.value.split(","))
        }
        name={"members"}
        label="Invitar Miembros"
        aria-label="invitar miembros"
        items={mockedUsers}
        isInvalid={!!errors.members}
        errorMessage={errors.members}
      />
      <Divider />
      <h6>Visibilidad del Grupo</h6>
      <Field
        as={CustomSelect}
        items={visibilityItems}
        disallowEmptySelection
        getItemValue={(item: any) => item.value}
        getItemTextValue={(item: any) => item.label}
        getItemLabel={(item: any) => item.label}
        name="visibility"
        label="¿Quién puede enviar la solicitud para unirse?"
        placeholder="Seleccionar la visibilidad"
        aria-label="visibilidad del grupo"
        isInvalid={!!errors.visibility}
        errorMessage={errors.visibility}
      />
    </>
  );
};

export default memo(Inputs);
