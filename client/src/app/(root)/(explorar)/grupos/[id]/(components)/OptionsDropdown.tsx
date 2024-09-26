"use client";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { FaShareAlt } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa6";
import { IoIosExit } from "react-icons/io";

const OptionsDropdown = ({ groupId }: { groupId: string }) => {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button radius="full" isIconOnly variant="light">
          <FaChevronDown />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="opciones de perfil">
        <DropdownItem
          startContent={<FaShareAlt />}
          color="secondary"
          key="new"
          className="rounded-full px-4"
        >
          Compartir
        </DropdownItem>
        <DropdownItem
          startContent={<IoIosExit />}
          color="danger"
          key="new"
          className="rounded-full px-4"
        >
          Salir del Grupo
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default OptionsDropdown;
