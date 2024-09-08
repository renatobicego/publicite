import { Link, NavbarItem, NavbarMenuToggle } from "@nextui-org/react";
import React from "react";
import SecondaryButton from "../buttons/SecondaryButton";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Notifications from "./Notifications";

import { CONFIGURATION, PROFILE } from "@/app/utils/urls";
import DropdownItems from "./DropdownItems";
import { FaUser } from "react-icons/fa6";

const UserNavItems = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  const { user } = useUser();
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
          >
            <UserButton.MenuItems>
              <UserButton.Link
                label="Mi Perfil"
                labelIcon={<FaUser />}
                href={`${PROFILE}/${user?.username}`}
              />
              <UserButton.Action label="manageAccount" />
            </UserButton.MenuItems>
          </UserButton>
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
