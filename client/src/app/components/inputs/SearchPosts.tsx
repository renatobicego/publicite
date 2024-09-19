import { Input } from "@nextui-org/react";
import { Dispatch, SetStateAction, useState } from "react";
import { FaSearch } from "react-icons/fa";

const SearchPosts = ({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <Input
      aria-label="buscar anuncios"
      variant="bordered"
      radius="full"
      startContent={<FaSearch className="text-light-text min-w-3.5" />}
      value={searchTerm}
      onValueChange={setSearchTerm}
      placeholder="Buscar en resultados..."
      classNames={{
        inputWrapper: `border-[0.5px] pr-0 group-data-[focus=true]:border-light-text 
        data-[hover=true]:border-light-text focus-within:border-[0.5px] min-h-6 max-lg:h-9`,
        input: "md:ml-1 text-sm",
      }}
    />
  );
};

export default SearchPosts;
