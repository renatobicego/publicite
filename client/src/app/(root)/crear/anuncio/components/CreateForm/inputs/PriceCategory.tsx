import {
  CustomInput,
  CustomSelect,
} from "@/app/components/inputs/CustomInputs";
import { frequencyPriceItems } from "@/app/utils/selectData";
import {
  GoodPostValues,
  PostCategory,
  ServicePostValues,
} from "@/types/postTypes";
import { Field, FormikErrors } from "formik";
import React from "react";
import { FaDollarSign } from "react-icons/fa6";

const PriceCategory = ({
  errors,
  isService = false,
}: {
  errors: FormikErrors<GoodPostValues> | FormikErrors<ServicePostValues>;
  isService?: boolean;
}) => {
  const categories: PostCategory[] = [
    {
      _id: "112sdq",
      label: "Casa",
    },
    {
      _id: "112egsdq",
      label: "Departamento",
    },
    {
      _id: "112qsdqsf",
      label: "Oficina",
    },
  ];
  return (
    <>
      <div className="flex gap-4 max-xl:flex-wrap">
        <Field
          as={CustomInput}
          name="price"
          type="number"
          startContent={<FaDollarSign />}
          label="Precio"
          placeholder="Agregue el precio"
          isRequired
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
