"use client";
import {
  CREATE_GROUP,
  CREATE_MAGAZINE,
  CREATE_PETITION,
  CREATE_POST,
} from "@/utils/data/urls";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Link,
} from "@nextui-org/react";
import { FaPlus } from "react-icons/fa6";
import { IoIosHelp } from "react-icons/io";

const HelpButton = () => {
  return (
    <>
      <Dropdown placement="top-end" className="bg-fondo max-lg:hidden">
        <DropdownTrigger className="fixed bottom-8 right-8 z-40 max-lg:hidden">
          <Button
            isIconOnly
            color="secondary"
            size="lg"
            radius="full"
            variant="light"
            className="bg-fondo shadow "
          >
            <IoIosHelp className="size-16" />
          </Button>
        </DropdownTrigger>

        <DropdownMenu aria-label="Static Actions" className="bg-fondo">
          <DropdownItem key="new">New file</DropdownItem>
          <DropdownItem key="copy">Copy link</DropdownItem>
          <DropdownItem key="edit">Edit file</DropdownItem>
          <DropdownItem key="delete" className="text-danger" color="danger">
            Delete file
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Dropdown placement="top-end" className="bg-fondo lg:hidden">
        <DropdownTrigger className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40 lg:hidden">
          <Button
            isIconOnly
            color="primary"
            size="lg"
            radius="full"
            variant="light"
            className="bg-fondo shadow "
          >
            <FaPlus className="size-6" />
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="opciones de publicaciones"
          className="bg-fondo"
        >
          <DropdownSection title="Crear">
            <DropdownItem as={Link} href={CREATE_POST} key="post">
              Anuncio
            </DropdownItem>
            <DropdownItem as={Link} href={CREATE_PETITION} key="petition">
              Necesidad
            </DropdownItem>
            <DropdownItem as={Link} href={CREATE_MAGAZINE} key="magazine">
              Revista
            </DropdownItem>
            <DropdownItem as={Link} href={CREATE_GROUP} key="group">
              Grupo
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </>
  );
};

export default HelpButton;
