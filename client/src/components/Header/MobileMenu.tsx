import {
  CONFIGURATION,
  CREATE,
  POSTS,
  PROFILE,
  TUTORIALS,
} from "@/utils/data/urls";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Link, NavbarMenu, NavbarMenuItem } from "@nextui-org/react";
import { Variants } from "framer-motion";
import React, { Dispatch, SetStateAction } from "react";
import Notifications from "./Notifications/Notifications";
import SecondaryButton from "../buttons/SecondaryButton";
import DropdownItems from "./DropdownItems";
import NextLink from "next/link"; 

const MobileMenu = ({
  setIsMenuOpen,
}: {
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { user, isSignedIn } = useUser();
  const menuItems = [
    {
      title: "Inicio",
      url: "/",
    },
    {
      title: "Explorar",
      url: POSTS,
    },
    {
      title: "Publicar",
      url: `${CREATE}`,
      isPrivate: true,
    },
    {
      title: "Mi Perfil",
      url: `${PROFILE}/${user?.username}`,
      isPrivate: true,
    },
    {
      title: "Configuración",
      url: `${CONFIGURATION}`,
      isPrivate: true,
    },
    {
      title: "Ver Tutoriales",
      url: TUTORIALS,
    },
  ];
  const variants: Variants = {
    visible: {
      transform: "translateY(0)",
      height: isSignedIn ? "290px" : "190px",
      opacity: 1,
    },
    hidden: { transform: "translateY(-50px)", height: "0px", opacity: 0 },
  };

  const shownItems = isSignedIn
    ? menuItems
    : menuItems.filter((item) => !item.isPrivate);
  return (
    <NavbarMenu
      motionProps={{
        variants,
        initial: "hidden",
        animate: "visible",
        exit: "hidden",
        transition: { duration: 0.3 },
      }}
      className="bg-white h-fit !w-auto header-spacing rounded-b-xl shadow-2xl fixed items-end gap-2 pr-6 md:pr-8 overflow-y-hidden"
    >
      {shownItems.map((item, index) => (
        <NavbarMenuItem key={`${item}-${index}`}>
          <NextLink href={item.url} passHref>
            <Link
              onClick={() => setIsMenuOpen(false)}
              className={`w-full text-text-color`}
              size="sm"
            >
              {item.title}
            </Link>
          </NextLink>
        </NavbarMenuItem>
      ))}
      <div className="flex gap-2 items-center">
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
          <DropdownItems />
        </SignedIn>
        <SignedOut>
          <SecondaryButton
            as={Link}
            href="/iniciar-sesion"
            variant="flat"
            className="-mr-4 mt-2"
          >
            Iniciar Sesión
          </SecondaryButton>
        </SignedOut>
      </div>
    </NavbarMenu>
  );
};

export default MobileMenu;
