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
import { SignedIn, SignedOut, SignOutButton, UserButton } from "@clerk/nextjs";
import { FaChevronDown } from "react-icons/fa6";
import Notifications from "./Notifications";

import { CONFIGURATION } from "@/app/utils/urls";

const UserNavItems = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  return (
    <>
      <NavbarItem className="max-lg:hidden flex gap-2 items-center">
        <SignedIn>
          <Notifications />
          <UserButton
            appearance={{
              elements: {
                rootBox: "size-8",
                avatarBox: "h-full w-full border-[0.8px]",
              },
            }}
            userProfileMode="navigation"
            userProfileUrl={CONFIGURATION}
          />
        </SignedIn>
        <SignedOut>
          <SecondaryButton as={Link} href="/iniciar-sesion" variant="flat">
            Iniciar Sesión
          </SecondaryButton>
        </SignedOut>
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
