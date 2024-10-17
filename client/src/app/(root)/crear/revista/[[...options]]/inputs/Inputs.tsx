import { Field, FormikErrors } from "formik";
import { memo } from "react";
import { CustomInput, CustomTextarea } from "@/components/inputs/CustomInputs";
import { PostGroupMagazine, PostUserMagazine } from "../initialValues";
import UserMagazineInputs from "./UserMagazineInputs";
import GroupMagazineInputs from "./GroupMagazineInputs";

const Inputs = ({
  errors,
  isUserMagazine,
  setValues,
  id,
}: {
  errors: FormikErrors<PostUserMagazine | PostGroupMagazine>;
  isUserMagazine: boolean;
  setValues: (
    values: (
      prevValues: PostUserMagazine | PostGroupMagazine
    ) => PostUserMagazine | PostGroupMagazine,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PostUserMagazine | PostGroupMagazine>>;
  id: string | null;
}) => {
  return (
    <>
      <Field
        as={CustomInput}
        name="name"
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
      {isUserMagazine ? (
        <UserMagazineInputs errors={errors} setValues={setValues} />
      ) : (
        <GroupMagazineInputs
          setValues={(
            values: (prevValues: PostGroupMagazine) => PostGroupMagazine
          ) =>
            setValues(
              values as (
                prevValues: PostGroupMagazine | PostUserMagazine
              ) => PostGroupMagazine | PostUserMagazine
            )
          }
          id={id}
        />
      )}
    </>
  );
};

export default memo(Inputs);
