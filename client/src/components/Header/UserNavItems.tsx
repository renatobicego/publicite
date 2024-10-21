import { Link, NavbarItem, NavbarMenuToggle } from "@nextui-org/react";
import React from "react";
import SecondaryButton from "../buttons/SecondaryButton";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Notifications from "./Notifications/Notifications";
import DropdownItems from "./DropdownItems";
import UserButtonModal from "@/app/(root)/(configuracion)/UserButtonPage";

const UserNavItems = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  const { user } = useUser();
  return (
    <>
      <NavbarItem className="max-lg:hidden flex gap-2 items-center">
        <SignedIn>
          <Notifications />
          <UserButtonModal />
          <DropdownItems />
        </SignedIn>
        <SignedOut>
          <SecondaryButton as={Link} href="/iniciar-sesion" variant="flat">
            Iniciar Sesión
          </SecondaryButton>
        </SignedOut>
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
