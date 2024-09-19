import { Link, NavbarItem } from "@nextui-org/react";
import React from "react";
import PrimaryButton from "../buttons/PrimaryButton";
import { CREATE, POSTS } from "@/app/utils/data/urls";

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
        <PrimaryButton as={Link} href={CREATE}>Publicar</PrimaryButton>
      </NavbarItem>
    </>
  );
};

export default NavMenuItems;
