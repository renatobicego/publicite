import { CustomInput, CustomTextarea } from "@/app/components/inputs/CustomInputs";
import { GoodPostValues, ServicePostValues } from "@/types/postTypes";
import { Field, FormikErrors } from "formik";

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
        labelPlacement="inside"
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
        labelPlacement="inside"
        isRequired
        aria-label="descripción"
        isInvalid={!!errors.description}
        errorMessage={errors.description}
      />
    </>
  );
};

export default TitleDescription;
