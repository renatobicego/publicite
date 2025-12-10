import { Select, Selection, SelectItem } from "@nextui-org/react";
import React from "react";

const SelectPostType = ({
  selectedPostType,
  setSelectedPostType,
}: {
  selectedPostType: Selection;
  setSelectedPostType: React.Dispatch<React.SetStateAction<Selection>>;
}) => {
  return (
    <Select
      selectionMode="single"
      placeholder="Seleccione el tipo de anuncio"
      selectedKeys={selectedPostType}
      onSelectionChange={setSelectedPostType}
      scrollShadowProps={{
        hideScrollBar: false,
      }}
      classNames={{
        trigger:
          "shadow-none hover:shadow-sm border-[0.5px] group-data-[focus=true]:border-light-text py-1",
        value: `text-[0.8125rem]`,
        label: `font-medium text-[0.8125rem]`,
      }}
      radius="full"
      variant="bordered"
      labelPlacement="outside"
      disallowEmptySelection
      aria-label="tipo de anuncio"
    >
      <SelectItem key="todos">Todos</SelectItem>
      <SelectItem key="bienes">Bienes</SelectItem>
      <SelectItem key="servicios">Servicios</SelectItem>
      <SelectItem key="necesidades">Necesidades</SelectItem>
    </Select>
  );
};

export default SelectPostType;
