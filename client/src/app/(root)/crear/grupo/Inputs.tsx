import { Field, FormikErrors } from "formik";
import { ChangeEvent, memo, useEffect, useState } from "react";
import {
  CustomInput,
  CustomSelect,
  CustomTextarea,
} from "@/components/inputs/CustomInputs";
import { groupVisibilityItems } from "@/utils/data/selectData";
import { Divider, Link } from "@nextui-org/react";
import { PostGroup } from "./CreateGroupForm";
import { fetchDataByType } from "@/utils/data/fetchDataByType";
import { GROUPS } from "@/utils/data/urls";
import { SelectUsers } from "@/components/inputs/SelectUsers";

const Inputs = ({
  errors,
  setFieldValue,
  showMembers = true,
  id,
}: {
  errors: FormikErrors<PostGroup>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PostGroup>>;
  showMembers?: boolean;
  id?: string;
}) => {
  const [listUsers, setListUsers] = useState([]);
  useEffect(() => {
    //debería traer contactos del admin
    fetchDataByType("users", null, 1).then((data: any) => {
      setListUsers(data.items);
    });
  }, []);
  return (
    <>
      <Field
        as={CustomInput}
        name="name"
        label="Nombre del Grupo"
        placeholder="Agregue un nombre"
        isRequired
        aria-label="nombre"
        isInvalid={!!errors.name}
        errorMessage={errors.name}
      />
      <Field
        as={CustomInput}
        name="alias"
        label="Alias del grupo"
        placeholder="alias"
        isRequired
        aria-label="alias"
        startContent={"@"}
        description="Mínimo 2 caracteres. Debe ser único."
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
        description="Máximo 300 caracteres"
        aria-label="reglas"
        isInvalid={!!errors.rules}
        errorMessage={errors.rules}
      />
      <Divider />
      {showMembers ? (
        <>
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
            items={listUsers}
            isInvalid={!!errors.members}
            errorMessage={errors.members}
          />
          <Divider />
        </>
      ) : (
        <p className="text-xs md:text-sm">
          Para gestionar los miembros del grupo, debe hacerlo desde la pestaña de {" "}
          <Link size="sm" href={`${GROUPS}/${id}/miembros`}>
            Administrar Miembros
          </Link>
        </p>
      )}
      <h6>Visibilidad del Grupo</h6>
      <Field
        as={CustomSelect}
        items={groupVisibilityItems}
        disallowEmptySelection
        getItemValue={(item: any) => item.value}
        getItemTextValue={(item: any) => item.label}
        getItemLabel={(item: any) => item.label}
        name="visibility"
        label="Visibilidad del Grupo"
        placeholder="Seleccionar la visibilidad"
        aria-label="visibilidad del grupo"
        isInvalid={!!errors.visibility}
        errorMessage={errors.visibility}
      />
    </>
  );
};

export default memo(Inputs);
