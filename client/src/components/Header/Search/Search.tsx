import { Input, Selection } from "@nextui-org/react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import { usePathname } from "next/navigation";

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
  const [selectedKeys, setSelectedKeys] = useState<string | null>(
    "recomendados"
  );
  // selected post type. By default, empty means that the user is searching for "bienes"
  const [selectedPostType, setSelectedPostType] = useState<Selection>(
    new Set([])
  );
  const router = useRouter();
  const pathname = usePathname();

  // Dynamically set the URL based on the selected search category
  const getSearchURL = (getBaseUrl?: boolean) => {
    if (!selectedKeys) return "";

    const postTypePath: { [key: string]: string } = {
      bienes: "",
      servicios: SERVICES,
      necesidades: NEEDS,
    };

    // get selected post type
    const postType = postTypePath[Array.from(selectedPostType)[0] as string];
    // generate url path
    const basePath = postType
      ? keyToPath[selectedKeys] + postType // if there is a post type, add to the path
      : keyToPath[selectedKeys];
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

  useEffect(() => {
    if (pathname.split("/")[1]) {
      setSelectedKeys(
        Object.keys(keyToPath).find((key) => keyToPath[key] === pathname) ||
          "recomendados"
      );
    }
  }, [pathname, selectedKeys]);
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
        input: "md:ml-1 text-[0.8125rem] lg:text-sm",
      }}
    />
  );
};

export default Search;
