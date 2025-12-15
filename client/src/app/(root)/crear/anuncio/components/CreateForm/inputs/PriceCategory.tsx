import {
  CustomInput,
  CustomPriceInput,
  CustomSelect,
} from "@/components/inputs/CustomInputs";
import { frequencyPriceItems } from "@/utils/data/selectData";
import { GoodPostValues, ServicePostValues } from "@/types/postTypes";
import { Field, FormikErrors } from "formik";
import React, { useEffect, useState } from "react";
import { FaDollarSign } from "react-icons/fa6";
import usePostCategories from "@/utils/hooks/usePostCategories";

const PriceCategory = ({
  errors,
  isService = false,
}: {
  errors: FormikErrors<GoodPostValues> | FormikErrors<ServicePostValues>;
  isService?: boolean;
}) => {
  const { categories } = usePostCategories();
  return (
    <>
      <div className="flex gap-4 max-xl:flex-wrap items-start">
        <Field
          as={CustomPriceInput}
          name="price"
          startContent={<FaDollarSign />}
          label="Precio"
          placeholder="Agregue el precio"
          aria-label="precio"
          isInvalid={!!errors.price}
          errorMessage={errors.price}
        />
        {isService && (
          <Field
            as={CustomSelect}
            items={frequencyPriceItems}
            getItemValue={(item: any) => item.value}
            getItemTextValue={(item: any) => item.label}
            getItemLabel={(item: any) => item.label}
            name="frequencyPrice"
            label="Frecuencia del Precio"
            placeholder="Seleccione la frecuencia del pago"
            aria-label="frecuencia de precio"
            isInvalid={
              !!(errors as FormikErrors<ServicePostValues>).frequencyPrice
            }
            errorMessage={
              (errors as FormikErrors<ServicePostValues>).frequencyPrice
            }
          />
        )}
      </div>
      <Field
        as={CustomSelect}
        items={categories}
        isLoading={categories.length === 0}
        getItemValue={(item: any) => item._id}
        getItemTextValue={(item: any) => item.label}
        getItemLabel={(item: any) => item.label}
        name="category"
        label="Categoría"
        placeholder="Seleccione la categoría"
        aria-label="categoría"
        isRequired
        isInvalid={!!errors.category}
        errorMessage={errors.category}
      />
    </>
  );
};

export default PriceCategory;
