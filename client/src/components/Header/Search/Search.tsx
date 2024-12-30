import {
  Input,
  Selection,
} from "@nextui-org/react";
import React, {
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import {
  BOARDS,
  GROUPS,
  NEEDS,
  POST_BEST,
  POST_CONTACTS,
  POST_NEXT_TO_EXPIRE,
  POST_RECENTS,
  POSTS,
  PROFILE,
  SERVICES,
} from "@/utils/data/urls";
import { useRouter } from "next-nprogress-bar";
import SearchButton from "./SearchButton";
import DropdownSolapas from "./DropdownSolapas/DropdownSolapas";

// this is the general search input on the header
const Search = ({ 
  isFocused,
  setIsFocused,
}: {
  isFocused: boolean;
  setIsFocused: Dispatch<SetStateAction<boolean>>;
  }) => {
  // search term state
  const [searchTerm, setSearchTerm] = useState("");
  // selected solapas keys
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set(["recomendados"])
  );
  // selected post type. By default, empty means that the user is searching for "bienes"
  const [selectedPostType, setSelectedPostType] = useState<Selection>(new Set([]));
  const router = useRouter(); // Next.js router for redirection

  // Dynamically set the URL based on the selected search category
  const getSearchURL = (getBaseUrl?: boolean) => {
    const keyToPath: { [key: string]: string } = {
      recomendados: POSTS,
      contactos: POST_CONTACTS,
      hoy: POST_RECENTS,
      puntuados: POST_BEST,
      vencer: POST_NEXT_TO_EXPIRE,
      pizarras: BOARDS,
      perfiles: PROFILE,
      grupos: GROUPS,
    };
    const postTypePath: { [key: string]: string } = {
      bienes: "",
      servicios: SERVICES,
      necesidades: NEEDS,
    };

    // get selected solapa
    const selectedKey = Array.from(selectedKeys)[0] as string;
    // get selected post type
    const postType = postTypePath[Array.from(selectedPostType)[0] as string];
    // generate url path
    const basePath = postType
      ? keyToPath[selectedKey] + postType // if there is a post type, add to the path
      : keyToPath[selectedKey];
    // if getBaseUrl is true, return the base path
    if (getBaseUrl) {
      return basePath;
    }
    // otherwise, return the base path with the search term
    return `${basePath}?busqueda=${encodeURIComponent(searchTerm)}`;
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const searchURL = getSearchURL();
      setSearchTerm("");
      router.push(searchURL);
    }
  };

  // handle enter key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  return (
    <Input
      startContent={
        searchTerm && (
          <SearchButton searchTerm={searchTerm} handleSearch={handleSearch} />
        )
      }
      endContent={
        <DropdownSolapas // dropdown solapas
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
          selectedPostType={selectedPostType}
          setSelectedPostType={setSelectedPostType}
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
      onBlur={() => {
        if (!searchTerm) {
          setIsFocused(false);
        }
      }}
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
