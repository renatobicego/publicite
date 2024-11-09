"use client";

import ConfirmModal from "@/components/modals/ConfirmModal";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { useRef } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { IoTrashOutline } from "react-icons/io5";

const MagazineOptionsDropdown = () => {
  const handleDelete = async () => {};
  const confirmDeleteRef = useRef<() => void>(() => {});
  const handleDeleteMagazineClick = () => {
    if (confirmDeleteRef.current) {
      confirmDeleteRef.current(); // Trigger custom open function to open the modal
    }
  };
  return (
    <>
      <Dropdown
        classNames={{
          trigger: "absolute top-0 right-0",
        }}
        placement="bottom-end"
      >
        <DropdownTrigger>
          <Button variant="light" isIconOnly radius="full" size="sm">
            <FaChevronDown />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions">
          <DropdownItem
            startContent={<IoTrashOutline />}
            key="delete"
            className="text-danger rounded-full px-4"
            color="danger"
            onPress={handleDeleteMagazineClick}
          >
            Borrar Revista
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <ConfirmModal
        ButtonAction={<></>}
        message="¿Desea eliminar la revista?"
        tooltipMessage="Eliminar revista"
        confirmText="Eliminar"
        onConfirm={handleDelete}
        customOpen={(openModal) => (confirmDeleteRef.current = openModal)}
      />
    </>
  );
};

export default MagazineOptionsDropdown;
