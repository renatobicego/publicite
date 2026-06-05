import {
  CustomPriceInput,
  CustomSelect,
} from "@/components/inputs/CustomInputs";
import { frequencyPriceItems } from "@/utils/data/selectData";
import { GoodPostValues, ServicePostValues } from "@/types/postTypes";
import { Field, FormikErrors, useFormikContext } from "formik";
import React, { useState } from "react";
import { FaDollarSign } from "react-icons/fa6";
import { Checkbox } from "@nextui-org/react";
import usePostCategories from "@/utils/hooks/usePostCategories";

const PriceCategory = ({
  errors,
  isService = false,
}: {
  errors: FormikErrors<GoodPostValues> | FormikErrors<ServicePostValues>;
  isService?: boolean;
}) => {
  const { categories } = usePostCategories();
  const { setFieldValue, values } = useFormikContext<GoodPostValues | ServicePostValues>();
  const [hidePrice, setHidePrice] = useState<
    "negotiable" | "no_price" | null
  >(() => {
    if (values.price === 8613.10) return "negotiable";
    return null;
  });

  const handleCheckbox = (option: "negotiable" | "no_price") => {
    if (hidePrice === option) {
      // Uncheck
      setHidePrice(null);
      setFieldValue("price", undefined)
    } else {
      setHidePrice(option);
      setFieldValue("price", option === "negotiable" ? 8613.10 : undefined);
    }
  };

  return (
    <>
      <div className="flex gap-4 max-xl:flex-wrap items-start">
        {!hidePrice && (
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
        )}
        {!hidePrice && isService && (
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
      <div className="flex gap-6 px-4">
        <Checkbox
          isSelected={hidePrice === "negotiable"}
          onValueChange={() => handleCheckbox("negotiable")}
          aria-label="Negociable / a pactar"
          size="sm"
        >
          Negociable / a pactar
        </Checkbox>
        <Checkbox
          isSelected={hidePrice === "no_price"}
          onValueChange={() => handleCheckbox("no_price")}
          aria-label="Sin precio"
          size="sm"
        >
          Sin Precio
        </Checkbox>
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
