import {
  CustomInput,
  CustomSelect,
} from "@/app/components/inputs/CustomInputs";
import { frequencyPriceItems } from "@/app/utils/selectData";
import { PetitionPostValues, PostCategory } from "@/types/postTypes";
import { Checkbox } from "@nextui-org/react";
import { Field, FormikErrors } from "formik";
import { useState } from "react";
import { FaDollarSign } from "react-icons/fa6";

const PriceRangeCategory = ({
  errors,
}: {
  errors: FormikErrors<PetitionPostValues>;
}) => {
  const [isChecked, setIsChecked] = useState(false);
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
        onChange={() => setIsChecked(!isChecked)}
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
        placeholder="Seleccione la categoría"
        aria-label="categoría"
        isRequired
        isInvalid={!!errors.category}
        errorMessage={errors.category}
      />
    </div>
  );
};

export default PriceRangeCategory;
