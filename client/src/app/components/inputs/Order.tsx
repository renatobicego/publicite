import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { Dispatch, SetStateAction } from "react";
import { FaSort } from "react-icons/fa6";

const Order = ({
  sortDescriptor,
  setSortDescriptor,
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
}) => {
  // Function to change or reset the sorting order
  const changeOrder = (key: any) => {
    setSortDescriptor((prevValue) => {
      const { column, direction } = prevValue;

      // Check if the same sort key was selected again and reset it
      switch (key) {
        case "aZ":
          if (column === "title" && direction === "ascending") {
            return { column: "", direction: "" };
          }
          return { column: "title", direction: "ascending" };

        case "zA":
          if (column === "title" && direction === "descending") {
            return { column: "", direction: "" };
          }
          return { column: "title", direction: "descending" };

        case "priceDesc":
          if (column === "price" && direction === "descending") {
            return { column: "", direction: "" };
          }
          return { column: "price", direction: "descending" };

        case "priceAsc":
          if (column === "price" && direction === "ascending") {
            return { column: "", direction: "" };
          }
          return { column: "price", direction: "ascending" };

        default:
          return prevValue;
      }
    });
  };

  // Determine the selected key based on sortDescriptor
  const selectedKey = () => {
    if (sortDescriptor.column === "title") {
      return sortDescriptor.direction === "ascending" ? ["aZ"] : ["zA"];
    } else if (sortDescriptor.column === "price") {
      return sortDescriptor.direction === "ascending"
        ? ["priceAsc"]
        : ["priceDesc"];
    }
    return []; // Default if no valid sortDescriptor is set
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button isIconOnly color="secondary" variant="bordered" radius="full">
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
        <DropdownItem key="aZ">A-Z</DropdownItem>
        <DropdownItem key="zA">Z-A</DropdownItem>
        <DropdownItem key="priceDesc">Precio de mayor a menor</DropdownItem>
        <DropdownItem key="priceAsc">Precio de menor a mayor</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default Order;
