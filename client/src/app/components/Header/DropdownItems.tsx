import { PACKS, SUBSCRIPTIONS } from "@/app/utils/urls";
import { SignOutButton } from "@clerk/nextjs";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
} from "@nextui-org/react";
import { FaChevronDown } from "react-icons/fa6";

const DropdownItems = () => {
  return (
    <Dropdown radius="lg">
      <DropdownTrigger>
        <Button radius="full" variant="light" size="sm" isIconOnly>
          <FaChevronDown />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Más acciones">
        <DropdownItem
          as={Link}
          href={SUBSCRIPTIONS}
          className="rounded-full text-text-color"
          key="planes"
          color="secondary"
          textValue="Planes de Subscripción"
        >
          Planes de Subscripción
        </DropdownItem>
        <DropdownItem
          as={Link}
          href={PACKS}
          className="rounded-full text-text-color"
          key="packs"
          color="secondary"
          textValue="Packs de Publicaciones"
        >
          Packs de Publicaciones
        </DropdownItem>
        <DropdownItem
          className="rounded-full"
          key="cerrar-sesion"
          color="danger"
          textValue="Cerrar Sesión"
        >
          <SignOutButton>Cerrar Sesión</SignOutButton>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default DropdownItems;
