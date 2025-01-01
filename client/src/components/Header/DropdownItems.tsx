import { PACKS, SUBSCRIPTIONS } from "@/utils/data/urls";
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
    <Dropdown radius="lg" placement="bottom-end" className="bg-fondo">
      <DropdownTrigger>
        <Button radius="full" variant="light" size="sm" isIconOnly aria-label="Más acciones">
          <FaChevronDown />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Más acciones" className="bg-fondo">
        <DropdownItem
          as={Link}
          href={SUBSCRIPTIONS}
          className="rounded-full pl-4 text-text-color"
          key="planes"
          color="secondary"
          textValue="Planes de Subscripción"
        >
          Planes de Subscripción
        </DropdownItem>
        <DropdownItem
          as={Link}
          href={PACKS}
          className="rounded-full pl-4 text-text-color"
          key="packs"
          color="secondary"
          textValue="Packs de Publicaciones"
        >
          Packs de Publicaciones
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default DropdownItems;
