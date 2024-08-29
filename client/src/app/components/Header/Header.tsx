"use client";
import {
  Image,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import { useState } from "react";
import Search from "./Search";
import NavMenuItems from "./NavMenuItems";
import UserNavItems from "./UserNavItems";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  return (
    <Navbar
      classNames={{
        wrapper:
          "max-w-full layout-spacing shadow-lg mt-4 rounded-full px-10",
      }}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="flex-1">
        <NavbarBrand as={Link} href="/" className="max-w-fit">
          <Image src="/logo.png" alt="Logo" width={60} height={40} />
        </NavbarBrand>
        <NavbarItem className="flex-1">
          <Search />
        </NavbarItem>
        <NavbarContent className="max-w-fit">
          <NavMenuItems />
        </NavbarContent>
      </NavbarContent>
      <NavbarContent justify="end" className="max-w-fit">
        <UserNavItems isMenuOpen={isMenuOpen} />
      </NavbarContent>
      
    </Navbar>
  );
};

export default Header;
