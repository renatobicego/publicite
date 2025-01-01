import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { SignedIn } from "@clerk/nextjs";
import { Select, Selection, SelectItem } from "@nextui-org/react";
import React from "react";

const SelectSolapa = ({
  selectedKeys,
  setSelectedKeys,
}: {
  selectedKeys: Selection;
  setSelectedKeys: React.Dispatch<React.SetStateAction<Selection>>;
}) => {
  const { userIdLogged } = useUserData();
  const solapasItems = [
    {
      key: "recomendados",
      label: "Recomendados",
      requiresLogin: false,
    },
    {
      key: "contactos",
      label: "Contactos",
      requiresLogin: true,
    },
    {
      key: "hoy",
      label: "Anuncios de Hoy",
      requiresLogin: false,
    },
    {
      key: "puntuados",
      label: "Mejor Puntuados",
      requiresLogin: false,
    },
    {
      key: "vencer",
      label: "Próximos a Vencer",
      requiresLogin: false,
    },
    {
      key: "pizarras",
      label: "Pizarras",
      requiresLogin: true,
    },
    {
      key: "perfiles",
      label: "Perfiles",
      requiresLogin: true,
    },
    {
      key: "grupos",
      label: "Grupos",
      requiresLogin: true,
    },
  ];
  // Filter out tabs that require login if the user is not logged in
  const filteredSolapas = solapasItems.filter(
    (tab) => !tab.requiresLogin || (tab.requiresLogin && userIdLogged)
  );
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
      {filteredSolapas.map((item, index) => (
        <SelectItem key={item.key} value={item.key} textValue={item.label}>
          {item.label}
        </SelectItem>
      ))}
    </Select>
  );
};

export default SelectSolapa;
