import { CustomInput, CustomTextarea } from "@/components/inputs/CustomInputs";
import { GoodPostValues, ServicePostValues } from "@/types/postTypes";
import { Field, FormikErrors } from "formik";
import { memo } from "react";

const TitleDescription = ({
  errors,
  setFieldValue,
}: {
  errors: FormikErrors<GoodPostValues> | FormikErrors<ServicePostValues>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<GoodPostValues>>;
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
        showEmojiPicker
        setFieldValue={setFieldValue}
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
