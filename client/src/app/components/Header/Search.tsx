import { Button, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input } from "@nextui-org/react";
import React from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

const Search = () => {
  return (
    <Input
      startContent={<FaSearch className="text-light-text" />}
      endContent={
        <>
          <Divider className="h-1/2" orientation="vertical" />
          <Dropdown className="ml-2">
            <DropdownTrigger>
              <Button
                radius="full"
                variant="light"
                className="rounded-l-none"
                endContent={<FaChevronDown />}
              >
                Solapa
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
      classNames={{
        inputWrapper: `border-secondary border-[0.5px] bg-[#F1FFFA] transition-all duration-300 pr-0 
              data-[hover=true]:bg-[#ECFFF8] data-[hover=true]:border-secondary focus-within:border-[0.5px]`,
      }}
    />
  );
};

export default Search;
