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
import { PostGroupMagazine, PostUserMagazine } from "./initialValues";

const Inputs = ({
  errors,
  isUserMagazine,
  setFieldValue,
}: {
  errors: FormikErrors<PostUserMagazine | PostGroupMagazine>;
  isUserMagazine: boolean;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PostUserMagazine | PostGroupMagazine>>;
}) => {
  return (
    <>
      <Field
        as={CustomInput}
        name="title"
        label="Título"
        placeholder="Agregue un título"
        isRequired
        aria-label="título"
        isInvalid={!!errors.name}
        errorMessage={errors.name}
      />
      <Field
        as={CustomTextarea}
        name="description"
        label="Descripción"
        placeholder="Agregue una descripción"
        description="Máximo 100 caracteres"
        aria-label="descripción"
        isInvalid={!!errors.description}
        errorMessage={errors.description}
      />
      {isUserMagazine && (
        <>
          <Divider />
          <Field
            as={CustomSelect}
            items={visibilityItems}
            allowEmptySelection={false}
            getItemValue={(item: any) => item.value}
            getItemTextValue={(item: any) => item.label}
            getItemLabel={(item: any) => item.label}
            name="visibility"
            label="Visibilidad de la Revista"
            placeholder="¿Quién puede ver la revista?"
            aria-label="visibilidad de la revista"
            isInvalid={!!(errors as FormikErrors<PostUserMagazine>).visibility}
            errorMessage={(errors as FormikErrors<PostUserMagazine>).visibility}
          />
        </>
      )}
      <Divider />
      <h6>
        {isUserMagazine
          ? "Invitar Colaboradores"
          : "¿Quién puede colaborar en la revista?"}
      </h6>
      <Field
        as={SelectUsers}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setFieldValue(
            isUserMagazine ? "collaborators" : "allowedCollaborators",
            e.target.value.split(",")
          )
        }
        name={isUserMagazine ? "collaborators" : "allowedCollaborators"}
        aria-label="invitar colaboradores"
        items={mockedUsers}
      />
      {!isUserMagazine && (
        <SecondaryButton
          size="sm"
          className="self-end"
          onPress={() =>
            setFieldValue(
              "allowedCollaborators",
              mockedUsers.map((user) => user._id)
            )
          }
        >
          Permitir a todos
        </SecondaryButton>
      )}
    </>
  );
};

export default memo(Inputs);
