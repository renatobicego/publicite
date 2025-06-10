import { Link, NavbarItem } from "@nextui-org/react";
import React from "react";
import PrimaryButton from "../buttons/PrimaryButton";
import { CREATE, POSTS } from "@/utils/data/urls";

const NavMenuItems = () => {
  return (
    <>
      <Link size="sm" className="text-text-color font-medium" href="/">
        Inicio
      </Link>
      <Link size="sm" className="text-text-color font-medium" href={POSTS}>
        Explorar
      </Link>
      <PrimaryButton as={Link} href={CREATE}>
        Publicar
      </PrimaryButton>
    </>
  );
};

export default NavMenuItems;
