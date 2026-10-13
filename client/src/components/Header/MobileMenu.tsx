import {
  ADMIN_INVOICES,
  ADMIN_PRODUCTION_REPORTS,
  ADMIN_PRODUCTION_TICKETS,
  CREATE,
  NOVELTIES,
  POSTS,
  PROFILE,
} from "@/utils/data/urls";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Link, NavbarMenu, NavbarMenuItem } from "@nextui-org/react";
import { Variants } from "framer-motion";
import React, { Dispatch, SetStateAction } from "react";
import SecondaryButton from "../buttons/SecondaryButton";
import DropdownItems from "./DropdownItems";
import NextLink from "next/link";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { OrangeCubeIcon } from "../buttons/ChatbotButton/OrangeCubeIcon";
import { FaTableColumns } from "react-icons/fa6";

const MobileMenu = ({
  setIsMenuOpen,
  isSignedIn,
  isAdmin = false,
}: {
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  isSignedIn: boolean;
  isAdmin?: boolean;
}) => {
  const { userIdLogged } = useUserData();
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
      title: "Cubito",
      url: "/cubito",
      icon: true,
    },
    {
      title: "Tablero",
      url: "/cubito/tablerodetrabajo",
      tableroIcon: true,
    },
    {
      title: "Publicar",
      url: `${CREATE}`,
      isPrivate: true,
    },
    {
      title: "Mi Cartel de Usuario",
      url: `${PROFILE}/${userIdLogged}`,
      isPrivate: true,
    },
    {
      title: "Admin: Facturación",
      url: ADMIN_INVOICES,
      isPrivate: true,
      isAdminOnly: true,
    },
    {
      title: "Admin: Tickets de Producciones",
      url: ADMIN_PRODUCTION_TICKETS,
      isPrivate: true,
      isAdminOnly: true,
    },
    {
      title: "Admin: Denuncias de Producciones",
      url: ADMIN_PRODUCTION_REPORTS,
      isPrivate: true,
      isAdminOnly: true,
    },
    {
      title: "Admin: Novedades",
      url: NOVELTIES,
      isPrivate: true,
      isAdminOnly: true,
    },
  ];
  const variants: Variants = {
    visible: {
      transform: "translateY(0)",
      height: !isSignedIn ? "190px" : isAdmin ? "410px" : "290px",
      opacity: 1,
    },
    hidden: { transform: "translateY(-50px)", height: "0px", opacity: 0 },
  };

  const shownItems = menuItems.filter(
    (item) =>
      (isSignedIn || !item.isPrivate) &&
      (isAdmin || !("isAdminOnly" in item && item.isAdminOnly))
  );
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
              className={`w-full text-text-color flex items-center gap-1`}
              size="sm"
            >
              {"icon" in item && item.icon && (
                <span className="w-8 h-8 flex-shrink-0 [&>svg]:w-full [&>svg]:h-full mt-1">
                  <OrangeCubeIcon />
                </span>
              )}
              {"tableroIcon" in item && item.tableroIcon && (
                <FaTableColumns size={14} className="text-service" />
              )}
              {item.title}
            </Link>
          </NextLink>
        </NavbarMenuItem>
      ))}
      <div className="flex gap-2 items-center">
        <SignedIn>
          <DropdownItems setIsMenuOpen={setIsMenuOpen} />
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
