import { Badge, Link, NavbarItem, NavbarMenuToggle } from "@nextui-org/react";
import React, { useEffect } from "react";
import SecondaryButton from "../buttons/SecondaryButton";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Notifications from "./Notifications/Notifications";
import DropdownItems from "./DropdownItems";
import UserButtonModal from "@/app/(root)/(configuracion)/UserButtonPage";
import { useSocket } from "@/app/socketProvider";
import { Subscription } from "@/types/subscriptions";
import { Board } from "@/types/board";
import { UserPreferences, UserType } from "@/types/userTypes";
import { ConfigData } from "@/app/(root)/(configuracion)/Profile/actions";

const UserNavItems = ({
  isMenuOpen,
  configData,
}: {
  isMenuOpen: boolean;
  configData: ConfigData | undefined;
}) => {
  const { newNotifications, setNewNotifications } = useSocket();
  useEffect(() => {
    if (isMenuOpen) setNewNotifications(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen]);
  return (
    <>
      <NavbarItem className="max-lg:hidden flex gap-2 items-center">
        <SignedIn>
          <Notifications />
          <UserButtonModal configData={configData} />
          <DropdownItems />
        </SignedIn>
        <SignedOut>
          <SecondaryButton as={Link} href="/iniciar-sesion" variant="flat">
            Iniciar Sesión
          </SecondaryButton>
        </SignedOut>
      </NavbarItem>
      {newNotifications ? (
        <Badge content="" color="primary" className="lg:hidden mt-2.5">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="lg:hidden min-h-12"
          />
        </Badge>
      ) : (
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="lg:hidden min-h-12"
        />
      )}
    </>
  );
};

export default UserNavItems;
