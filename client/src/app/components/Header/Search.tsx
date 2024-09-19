import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Selection,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import SecondaryButton from "../buttons/SecondaryButton";
import {
  BOARDS,
  GROUPS,
  MAGAZINES,
  POST_BEST,
  POST_NEXT_TO_EXPIRE,
  POST_RECENTS,
  POSTS,
  PROFILE,
} from "@/app/utils/data/urls";

const Search = ({
  isFocused,
  setIsFocused,
}: {
  isFocused: boolean;
  setIsFocused: Dispatch<SetStateAction<boolean>>;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set(["recomendados"])
  );
  const router = useRouter(); // Next.js router for redirection

  // Dynamically set the URL based on the selected search category
  const getSearchURL = () => {
    const keyToPath: { [key: string]: string } = {
      recomendados: POSTS,
      hoy: POST_RECENTS,
      puntuados: POST_BEST,
      vencer: POST_NEXT_TO_EXPIRE,
      pizarras: BOARDS,
      contactos: PROFILE,
      grupos: GROUPS,
    };

    const selectedKey = Array.from(selectedKeys)[0] as string;
    const basePath = keyToPath[selectedKey];
    return `${basePath}?busqueda=${encodeURIComponent(searchTerm)}`;
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const searchURL = getSearchURL();
      router.push(searchURL);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Input
      startContent={
        <SearchButton searchTerm={searchTerm} handleSearch={handleSearch} />
      }
      endContent={
        <DropdownSolapas
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
        />
      }
      placeholder="Buscar"
      radius="full"
      aria-label="buscar"
      color="secondary"
      value={searchTerm}
      onValueChange={setSearchTerm}
      variant="bordered"
      onFocus={() => setIsFocused(true)}
      onKeyDown={handleKeyDown}
      onBlur={() => setIsFocused(false)}
      className={`!transition-all duration-300 ${
        isFocused ? "!w-full flex-grow" : "w-auto"
      }`}
      classNames={{
        inputWrapper: `border-secondary border-[0.5px] bg-[#F1FFFA] !transition-all duration-300 pr-0 
              data-[hover=true]:bg-[#ECFFF8] data-[hover=true]:border-secondary focus-within:border-[0.5px]
               min-h-6 max-lg:h-9`,
        input: "md:ml-1 text-sm",
      }}
    />
  );
};

export default Search;

const DropdownSolapas = ({
  selectedKeys,
  setSelectedKeys,
}: {
  selectedKeys: Selection;
  setSelectedKeys: Dispatch<SetStateAction<Selection>>;
}) => {
  const keyToLabel: { [key: string]: string } = {
    recomendados: "Recomendados",
    hoy: "Anuncios de Hoy",
    puntuados: "Mejor Puntuados",
    vencer: "Próximos a Vencer",
    pizarras: "Pizarras",
    contactos: "Contactos",
    grupos: "Grupos",
  };

  const selectedValue = useMemo(
    () =>
      Array.from(selectedKeys)
        .map((key) => keyToLabel[key as string])
        .join(", "),
    [selectedKeys]
  );

  return (
    <>
      <Divider className="h-1/2" orientation="vertical" />
      <Dropdown className="ml-2" placement="bottom-end">
        <DropdownTrigger>
          <Button
            radius="full"
            variant="light"
            className="rounded-l-none max-md:min-w-10 px-0 md:px-3 lg:px-4 md:max-lg:h-9 min-h-6 max-md:h-7 text-sm text-light-text"
            endContent={
              <FaChevronDown className="min-w-1 md:min-w-2 mt-0.5 text-light-text max-md:hidden" />
            }
          >
            <span className="max-md:hidden">{selectedValue}</span>
            <FaChevronDown className="min-w-1 text-light-text md:hidden" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          variant="light"
          disallowEmptySelection
          aria-label="opciones de búsqueda"
        >
          <DropdownItem key="recomendados">Recomendados</DropdownItem>
          <DropdownItem key="hoy">Anuncios de Hoy</DropdownItem>
          <DropdownItem key="puntuados">Mejor Puntuados</DropdownItem>
          <DropdownItem key="vencer">Próximos a Vencer</DropdownItem>
          <DropdownItem key="pizarras">Pizarras</DropdownItem>
          <DropdownItem key="contactos">Contactos</DropdownItem>
          <DropdownItem key="grupos">Grupos</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </>
  );
};

const SearchButton = ({
  searchTerm,
  handleSearch,
}: {
  searchTerm: string;
  handleSearch: () => void;
}) => {
  return (
    <div className={`relative flex items-center ${searchTerm ? "min-w-fit" : "min-w-5"}`}>
      <FaSearch
        className={`text-light-text min-w-3.5 absolute transition-opacity transform duration-300 ${
          searchTerm ? "opacity-0 scale-0" : "opacity-100 scale-100"
        }`}
      />
      <SecondaryButton
        size="sm"
        startContent={<FaSearch className="min-w-3.5" />}
        onPress={handleSearch}
        className={`transition-opacity transform duration-300 ${
          searchTerm
            ? "opacity-100 scale-100 relative min-w-fit"
            : "opacity-0 scale-0 absolute w-0"
        }`}
      >
        Buscar
      </SecondaryButton>
    </div>
  );
};
