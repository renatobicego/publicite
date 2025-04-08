import { PACKS, SUBSCRIPTIONS } from "@/utils/data/urls";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { FaChevronDown } from "react-icons/fa6";

const DropdownItems = ({
  setIsMenuOpen,
}: {
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const redirectAndCloseMenu = (url: string) => {
    setIsMenuOpen((prev) => !prev);
    window.location.replace(url);
  };
  return (
    <Dropdown radius="lg" placement="bottom-end" className="bg-fondo">
      <DropdownTrigger>
        <Button
          radius="full"
          variant="light"
          size="sm"
          isIconOnly
          aria-label="Más acciones"
        >
          <FaChevronDown />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Más acciones" className="bg-fondo">
        <DropdownItem
          onPress={() => redirectAndCloseMenu(SUBSCRIPTIONS)}
          className="rounded-full pl-4 text-text-color"
          key="planes"
          color="secondary"
          textValue="Planes de Subscripción"
        >
          Planes de Subscripción
        </DropdownItem>
        <DropdownItem
          onPress={() => redirectAndCloseMenu(PACKS)}
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
