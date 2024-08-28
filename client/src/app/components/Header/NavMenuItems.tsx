import { Link, NavbarItem } from "@nextui-org/react";
import React from "react";
import PrimaryButton from "../buttons/PrimaryButton";

const NavMenuItems = () => {
  return (
    <>
      <NavbarItem>
        <Link size="sm" className="text-text-color font-medium" href="#">
          Inicio
        </Link>
      </NavbarItem>
      <NavbarItem>
        <Link size="sm" className="text-text-color font-medium" href="#">
          Explorar
        </Link>
      </NavbarItem>
      <NavbarItem>
        <PrimaryButton>Publicar</PrimaryButton>
      </NavbarItem>
    </>
  );
};

export default NavMenuItems;
