import { Select, Selection, SelectItem } from "@nextui-org/react";
import React from "react";

const SelectSolapa = ({
  selectedKeys,
  setSelectedKeys,
}: {
  selectedKeys: Selection;
  setSelectedKeys: React.Dispatch<React.SetStateAction<Selection>>;
}) => {
  return (
    <Select
      selectionMode="single"
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
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
      aria-label="opciones de búsqueda"
    >
      <SelectItem key="recomendados">Recomendados</SelectItem>
      <SelectItem key="contactos">Contactos</SelectItem>
      <SelectItem key="hoy">Anuncios de Hoy</SelectItem>
      <SelectItem key="puntuados">Mejor Puntuados</SelectItem>
      <SelectItem key="vencer">Próximos a Vencer</SelectItem>
      <SelectItem key="pizarras">Pizarras</SelectItem>
      <SelectItem key="perfiles">Perfiles</SelectItem>
      <SelectItem key="grupos">Grupos</SelectItem>
    </Select>
  );
};

export default SelectSolapa;
