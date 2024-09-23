import { CustomInput, CustomTextarea } from "@/components/inputs/CustomInputs";
import { GoodPostValues, ServicePostValues } from "@/types/postTypes";
import { Field, FormikErrors } from "formik";
import { memo } from "react";

const TitleDescription = ({
  errors,
}: {
  errors: FormikErrors<GoodPostValues> | FormikErrors<ServicePostValues>;
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
        isInvalid={!!errors.title}
        errorMessage={errors.title}
      />
      <Field
        as={CustomTextarea}
        name="description"
        label="Descripción"
        placeholder="Agregue una descripción"
        description="Máximo 2000 caracteres"
        aria-label="descripción"
        isInvalid={!!errors.description}
        errorMessage={errors.description}
      />
    </>
  );
};

export default memo(TitleDescription);
