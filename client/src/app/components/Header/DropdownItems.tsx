import { SUBSCRIPTIONS } from "@/app/utils/urls";
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
        >
          Planes de Subscripción
        </DropdownItem>
        <DropdownItem
          className="rounded-full"
          key="cerrar-sesion"
          color="danger"
        >
          <SignOutButton>Cerrar Sesión</SignOutButton>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default DropdownItems;
