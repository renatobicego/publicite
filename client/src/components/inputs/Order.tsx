import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { Dispatch, SetStateAction } from "react";
import { FaSort } from "react-icons/fa6";

export type SortOption = {
  label: string;
  key: string;
  direction: "ascending" | "descending";
  column: string;
};

const Order = ({
  sortDescriptor,
  setSortDescriptor,
  sortOptions,
}: {
  sortDescriptor: {
    column: string;
    direction: string;
  };
  setSortDescriptor: Dispatch<
    SetStateAction<{
      column: string;
      direction: string;
    }>
  >;
  sortOptions: SortOption[];
}) => {
  // change or reset the sorting order
  const changeOrder = (key: any) => {
    const selectedOption = sortOptions.find((option) => option.key === key);

    if (!selectedOption) return;

    setSortDescriptor((prevValue) => {
      const { column, direction } = prevValue;

      // Reset if the same sort key and direction are selected
      if (
        column === selectedOption.column &&
        direction === selectedOption.direction
      ) {
        return { column: "", direction: "" };
      }

      return {
        column: selectedOption.column,
        direction: selectedOption.direction,
      };
    });
  };

  // Determine the selected key based on sortDescriptor
  const selectedKey = () => {
    const currentOption = sortOptions.find(
      (option) =>
        option.column === sortDescriptor.column &&
        option.direction === sortDescriptor.direction
    );
    return currentOption ? [currentOption.key] : [];
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          isIconOnly
          aria-label="Ordenar por"
          color="secondary"
          className="max-md:size-8 max-md:min-w-8"
          variant="bordered"
          radius="full"
        >
          <FaSort />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        onAction={changeOrder}
        closeOnSelect={false}
        aria-label="opciones de orden"
        selectionMode="single"
        selectedKeys={selectedKey()}
      >
        {sortOptions.map((option) => (
          <DropdownItem key={option.key}>{option.label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default Order;
