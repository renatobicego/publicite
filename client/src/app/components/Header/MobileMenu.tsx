import {
  CONFIGURATION,
  GROUPS,
  MAGAZINES,
  POSTS,
  PROFILE,
  TUTORIALS,
} from "@/app/utils/urls";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Link, NavbarMenu, NavbarMenuItem } from "@nextui-org/react";
import { Variants } from "framer-motion";
import React from "react";
import Notifications from "./Notifications";
import SecondaryButton from "../buttons/SecondaryButton";

const MobileMenu = () => {
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
      title: "Mis Grupos",
      url: `${PROFILE}/${user?.username}/${GROUPS}}`,
      isPrivate: true,
    },
    {
      title: "Mis Revistas",
      url: `${PROFILE}/${user?.username}/${MAGAZINES}}`,
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
    visible: { transform: "translateY(0)", height: isSignedIn ?  "270px" : "180px", opacity: 1 },
    hidden: { transform: "translateY(-50px)", height: "0px", opacity: 0 },
  };

  const shownItems = isSignedIn ? menuItems : menuItems.filter((item) => !item.isPrivate);
  return (
    <NavbarMenu
      motionProps={{
        variants,
        initial: "hidden",
        animate: "visible",
        exit: "hidden",
        transition: { duration: 0.3 },
      }}
      className="bg-white h-fit !w-auto mx-4 px-6 pb-6 md:mx-10 md:px-8 rounded-b-xl shadow-2xl fixed items-end gap-1"
    >
      {shownItems.map((item, index) => (
        <NavbarMenuItem key={`${item}-${index}`}>
          <Link  className={`w-full text-text-color`} href={item.url} size="sm">
            {item.title}
          </Link>
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
        </SignedIn>
        <SignedOut>
          <SecondaryButton as={Link} href="/iniciar-sesion" variant="flat" className="-mr-4 mt-2">
            Iniciar Sesión
          </SecondaryButton>
        </SignedOut>
      </div>
    </NavbarMenu>
  );
};

export default MobileMenu;
