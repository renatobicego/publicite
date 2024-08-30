import { Link, NavbarMenu, NavbarMenuItem } from "@nextui-org/react";
import { Variants } from "framer-motion";
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
  const variants: Variants = {
    visible: { transform: "translateY(0)",  height: "200px", opacity: 1 },
    hidden: { transform: "translateY(-50px)", height: "0px", opacity: 0 },
  };
  return (
    <NavbarMenu
      motionProps={{
        variants,
        initial: "hidden",
        animate: "visible",
        exit: "hidden",
        transition: { duration: 0.3 },
      }}
      className="bg-white h-fit !w-auto mx-4 px-6 pb-6 md:mx-10 md:px-8 rounded-b-xl shadow-xl absolute"
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
