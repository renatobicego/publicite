import { useState } from "react";
import FormCard from "../FormCard";
import { Button, Select, Selection, SelectItem } from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";

const SearchTermsForm = ({
  setIsFormVisible,
}: {
  setIsFormVisible: (value: boolean) => void;
}) => {
  const [values, setValues] = useState<Selection>(new Set([]));
  const categories = [
    {
      _id: 1,
      label: "Animales",
    },
    {
      _id: 2,
      label: "Comida",
    },
    {
      _id: 3,
      label: "Deportes",
    },
  ];
  return (
    <FormCard title="Preferencias de búsqueda" cardBodyClassname="flex gap-4 flec-col">
      <Select
        label="Intereses"
        placeholder="Seleccione una o más categorías"
        selectionMode="multiple"
        className="max-w-full"
        scrollShadowProps={{
          hideScrollBar: false,
        }}
        classNames={{
          trigger: "shadow-none hover:shadow-sm border-[0.5px]",
          value: "text-[0.8125rem]",
          label: "font-medium text-[0.8125rem]",
        }}
        radius="full"
        variant="bordered"
        labelPlacement="outside"
        selectedKeys={values}
        onSelectionChange={setValues}
      >
        {categories.map((category) => (
          <SelectItem key={category._id}>{category.label}</SelectItem>
        ))}
      </Select>
      <div className="flex gap-2 w-full justify-end">
        <Button
          color="default"
          variant="light"
          radius="full"
          onPress={() => setIsFormVisible(false)}
        >
          Cancelar
        </Button>
        <PrimaryButton type="submit">Actualizar</PrimaryButton>
      </div>
    </FormCard>
  );
};

export default SearchTermsForm;
