import { Link, NavbarMenu, NavbarMenuItem } from "@nextui-org/react";
import { transform } from "next/dist/build/swc";
import React from "react";

const MobileMenu = () => {
  const menuItems = [
    {
      title: "Inicio",
      url: "/",
    },
    {
      title: "Anuncios",
      url: "/anuncios",
    },
    {
      title: "Cuenta",
      url: "/cuenta",
    },
    {
      title: "Ayuda",
      url: "/ayuda",
    },
  ];
  const variants = {
    visible: { transform: "translateY(0)", opacity: 1, height: 300 },
    hidden: { transform: "translateY(-50px)", opacity: 0, height: 0 },
  };
  return (
    <NavbarMenu
      portalContainer={document.querySelector("#navbar") as HTMLElement}
      motionProps={{
        variants,
        initial: "hidden",
        animate: "visible",
        exit: "hidden",
        transition: { duration: 0.3 },
      }}
      className="bg-white !h-fit !w-auto mx-4 px-6 pb-6 md:mx-10 md:px-8 rounded-b-xl shadow-xl absolute"
    >
      {menuItems.map((item, index) => (
        <NavbarMenuItem  key={`${item}-${index}`}>
          <Link
            color={
              index === 2
                ? "primary"
                : index === menuItems.length - 1
                ? "danger"
                : "foreground"
            }
            className="w-full"
            href={item.url}
            size="lg"
          >
            {item.title}
          </Link>
        </NavbarMenuItem>
      ))}
    </NavbarMenu>
  );
};

export default MobileMenu;
