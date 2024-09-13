import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from "@nextui-org/react";
import React, { Dispatch, SetStateAction } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

const Search = ({
  isFocused,
  setIsFocused,
}: {
  isFocused: boolean;
  setIsFocused: Dispatch<SetStateAction<boolean>>;
}) => {
  // const screenSize = useWid
  return (
    <Input
      startContent={<FaSearch className="text-light-text min-w-3.5" />}
      endContent={
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
                <span className="max-md:hidden">Solapa</span>
                <FaChevronDown className="min-w-1 text-light-text md:hidden" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
              <DropdownItem key="new">New file</DropdownItem>
              <DropdownItem key="copy">Copy link</DropdownItem>
              <DropdownItem key="edit">Edit file</DropdownItem>
              <DropdownItem key="delete" className="text-danger" color="danger">
                Delete file
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </>
      }
      placeholder="Buscar"
      radius="full"
      aria-label="buscar"
      color="secondary"
      variant="bordered"
      onFocus={() => setIsFocused(true)}
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
