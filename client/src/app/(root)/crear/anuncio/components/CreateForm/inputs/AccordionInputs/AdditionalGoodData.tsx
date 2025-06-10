import { CustomInput } from "@/components/inputs/CustomInputs";
import { GoodPostValues, ServicePostValues } from "@/types/postTypes";
import { Field, FormikErrors } from "formik";
import React from "react";

const AdditionalGoodData = ({
  errors,
}: {
  errors: FormikErrors<GoodPostValues>;
}) => {

  return (
    <div className="flex gap-2 max-xl:flex-wrap">
      <Field
        as={CustomInput}
        name="brand"
        label="Marca"
        placeholder="Agregue la marca"
        aria-label="marca"
        className="lg:max-xl:w-2/3"
        isInvalid={!!errors.brand}
        errorMessage={errors.brand}
      />
      <Field
        as={CustomInput}
        name="year"
        type="number"
        label="Año"
        placeholder="Agregue el año"
        className="lg:max-xl:flex-1"
        aria-label="año"
        isInvalid={!!errors.year}
        errorMessage={errors.year}
      />
       <Field
        as={CustomInput}
        name="modelType"
        label="Modelo"
        placeholder="Agregue el modelo"
        aria-label="modelo"
        isInvalid={!!errors.modelType}
        errorMessage={errors.modelType}
      />
    </div>
  );
};

export default AdditionalGoodData;
