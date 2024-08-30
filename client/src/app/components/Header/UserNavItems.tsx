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
import { IoIosClose, IoIosMenu } from "react-icons/io";
import MobileMenu from "./MobileMenu";

const UserNavItems = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  const { isSignedIn, user } = useUser();
  return (
    <>
      <NavbarItem className="max-lg:hidden">
        <Notifications />
      </NavbarItem>
      <NavbarItem className="max-lg:hidden">
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
      <NavbarItem className="max-lg:hidden">
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
        // icon={isMenuOpen ? <IoIosClose className="size-6"/> : <IoIosMenu className="size-6"/>}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="lg:hidden min-h-12"
      />
    </>
  );
};

export default UserNavItems;
