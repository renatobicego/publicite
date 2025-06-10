import { Button } from "@nextui-org/react";
import React from "react";
import { FaChevronDown } from "react-icons/fa";

const OpenDropdownButton = ({
  onOpen,
  selectedValue,
}: {
  onOpen: () => void;
  selectedValue: string;
}) => {
  return (
    <Button
      id="solapas-button"
      onPress={onOpen}
      radius="full"
      variant="light"
      className="rounded-l-none min-w-10 md:min-w-fit px-0 md:px-3 lg:px-4 
              md:max-lg:h-9 min-h-6 max-md:h-7 text-sm text-light-text"
      endContent={
        <FaChevronDown className="min-w-1 md:min-w-2 mt-0.5 text-light-text max-md:hidden" />
      }
    >
      <span className="max-md:hidden">{selectedValue}</span>
      <FaChevronDown className="min-w-1 text-light-text md:hidden" />
    </Button>
  );
};

export default OpenDropdownButton;
