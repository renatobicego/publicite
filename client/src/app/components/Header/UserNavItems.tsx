import { Link, NavbarItem, NavbarMenuToggle } from "@nextui-org/react";
import React from "react";
import SecondaryButton from "../buttons/SecondaryButton";

const UserNavItems = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  return (
    <>
      <NavbarItem>
        <SecondaryButton as={Link} href="/iniciar-sesion" variant="flat">
          Iniciar Sesión
        </SecondaryButton>
      </NavbarItem>
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />
    </>
  );
};

export default UserNavItems;
