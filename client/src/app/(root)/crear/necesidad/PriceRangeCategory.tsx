import { CustomInput, CustomSelect } from "@/components/inputs/CustomInputs";
import { frequencyPriceItems } from "@/utils/data/selectData";
import { PetitionPostValues, PostCategory } from "@/types/postTypes";
import { Checkbox } from "@nextui-org/react";
import { Field, FormikErrors } from "formik";
import { memo, useEffect, useState } from "react";
import { FaDollarSign } from "react-icons/fa6";
import { getCategories } from "@/services/postsServices";
import { toastifyError } from "@/utils/functions/toastify";

const PriceRangeCategory = ({
  errors,
  setFieldValue,
  defaultChecked = false,
}: {
  errors: FormikErrors<PetitionPostValues>;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PetitionPostValues>>;
  defaultChecked?: boolean;
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked ? true : false);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  useEffect(() => {
    getCategories().then((data) => {
      if (data.error) {
        toastifyError(data.error);
        return;
      }
      setCategories(data);
    });
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Field
          as={CustomInput}
          name="price"
          type="number"
          startContent={<FaDollarSign />}
          label={isChecked ? "Precio Desde" : "Precio"}
          placeholder="Agregue el precio"
          isRequired
          aria-label="precio"
          isInvalid={!!errors.price}
          errorMessage={errors.price}
        />
        {isChecked && (
          <Field
            as={CustomInput}
            name="toPrice"
            type="number"
            startContent={<FaDollarSign />}
            label="Precio Hasta"
            placeholder="Agregue el precio"
            isRequired
            aria-label="precio hasta"
            isInvalid={!!errors.toPrice}
            errorMessage={errors.toPrice}
          />
        )}
      </div>
      <Checkbox
        size="sm"
        checked={isChecked}
        isSelected={isChecked}
        onChange={() => {
          setIsChecked(!isChecked);
          if (isChecked) {
            setFieldValue("toPrice", null);
          }
        }}
      >
        Agregar rango de precios
      </Checkbox>
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
        isInvalid={!!errors.frequencyPrice}
        errorMessage={errors.frequencyPrice}
      />
      <Field
        as={CustomSelect}
        items={categories}
        getItemValue={(item: any) => item._id}
        getItemTextValue={(item: any) => item.label}
        getItemLabel={(item: any) => item.label}
        name="category"
        label="Categoría"
        isLoading={categories.length === 0}
        placeholder="Seleccione la categoría"
        aria-label="categoría"
        isRequired
        isInvalid={!!errors.category}
        errorMessage={errors.category}
      />
    </div>
  );
};

export default memo(PriceRangeCategory);
