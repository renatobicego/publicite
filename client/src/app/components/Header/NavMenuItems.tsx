import { Link, NavbarItem } from "@nextui-org/react";
import React from "react";
import PrimaryButton from "../buttons/PrimaryButton";
import { POSTS } from "@/app/utils/urls";

const NavMenuItems = () => {
  return (
    <>
      <NavbarItem>
        <Link size="sm" className="text-text-color font-medium" href="/">
          Inicio
        </Link>
      </NavbarItem>
      <NavbarItem>
        <Link size="sm" className="text-text-color font-medium" href={POSTS}>
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
