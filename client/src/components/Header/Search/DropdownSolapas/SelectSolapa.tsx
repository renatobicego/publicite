import { useUserData } from "@/app/(root)/providers/userDataProvider";
import {
  Autocomplete,
  Radio,
  RadioGroup,
  Select,
  Selection,
  SelectItem,
} from "@nextui-org/react";
import React, { Key } from "react";

const SelectSolapa = ({
  selectedKeys,
  setSelectedKeys,
}: {
  selectedKeys: string | null;
  setSelectedKeys: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const { userIdLogged } = useUserData();
  const solapasItems = [
    {
      key: "recomendados",
      label: "Anuncios Libres",
      requiresLogin: false,
    },
    {
      key: "contactos",
      label: "Anuncios de Agenda de Contactos",
      requiresLogin: true,
    },
    // {
    //   key: "hoy",
    //   label: "Anuncios de Hoy",
    //   requiresLogin: false,
    // },
    // {
    //   key: "puntuados",
    //   label: "Mejor Puntuados",
    //   requiresLogin: false,
    // },
    // {
    //   key: "vencer",
    //   label: "Próximos a Vencer",
    //   requiresLogin: false,
    // },
    {
      key: "pizarras",
      label: "Pizarras",
      requiresLogin: true,
    },
    {
      key: "perfiles",
      label: "Carteles de Usuario",
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

  const onSelectionChange = (keys: Key | null) =>
    setSelectedKeys(keys as string | null);
  return (
    <>
      <RadioGroup
        value={selectedKeys}
        title="Seleccione una solapa"
        size="sm"
        onValueChange={onSelectionChange}
        aria-label="opciones de búsqueda"
      >
        {filteredSolapas.map((item, index) => (
          <Radio key={item.key} value={item.key}>
            {item.label}
          </Radio>
        ))}
      </RadioGroup>
      {["recomendados", "contactos", "hoy", "puntuados", "vencer"]?.includes(
        selectedKeys as string
      ) && (
        <p className="text-sm font-semibold">
          Por favor, seleccione un tipo de anuncio
        </p>
      )}
    </>
  );
};

export default SelectSolapa;
