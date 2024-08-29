import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  NavbarItem,
  NavbarMenuToggle,
} from "@nextui-org/react";
import React from "react";
import SecondaryButton from "../buttons/SecondaryButton";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { FaChevronDown } from "react-icons/fa6";
import Notifications from "./Notifications";

const UserNavItems = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  const { isSignedIn, user } = useUser();
  return (
    <>
      <NavbarItem>
        <Notifications />
      </NavbarItem>
      <NavbarItem>
        {isSignedIn ? (
          <Avatar
            size="sm"
            isBordered
            as={Link}
            href={`/perfil`}
            src={user.imageUrl}
          />
        ) : (
          <SecondaryButton as={Link} href="/iniciar-sesion" variant="flat">
            Iniciar Sesión
          </SecondaryButton>
        )}
      </NavbarItem>
      <NavbarItem>
        <Dropdown radius="full">
          <DropdownTrigger>
            <Button radius="full" variant="light" size="sm" isIconOnly>
              <FaChevronDown />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Más acciones">
            <DropdownItem
              className="rounded-full"
              key="cerrar-sesion"
              color="danger"
            >
              <SignOutButton>Cerrar Sesión</SignOutButton>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarItem>
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />
    </>
  );
};

export default UserNavItems;
