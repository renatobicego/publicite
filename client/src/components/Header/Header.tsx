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
import MobileMenu from "./MobileMenu";
import dynamic from "next/dynamic";
import NavMenuItems from "./NavMenuItems";
import { UserType } from "@/types/userTypes";
import { ConfigData } from "@/app/(root)/(configuracion)/Profile/actions";
const UserNavItems = dynamic(() => import("./UserNavItems"), {
  ssr: false,
});

const Header = ({
  configData,
  username,
  userType,
  isSignedIn,
}: {
  configData?: ConfigData;
  username: string;
  userType: UserType;
  isSignedIn: boolean;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Navbar
      id="navbar"
      disableAnimation={false}
      classNames={{
        wrapper: `max-w-full header-spacing shadow-md mt-4 rounded-3xl md:rounded-[40px] lg:rounded-full max-md:gap-2 
            px-6 md:px-8 lg:px-10 max-md:h-12 bg-white
             duration-500 items-start transition-all 
             ${isMenuOpen ? "rounded-b-none shadow-none" : ""}`,
        base: "pb-4 bg-transparent",
      }}
      shouldHideOnScroll
      onMenuOpenChange={setIsMenuOpen}
      isBlurred={false}
    >
      <NavbarContent
        className={`flex-1 max-md:gap-2 transition-all duration-300 ${
          isFocused ? "w-full flex-shrink" : "w-auto"
        }`}
      >
        <NavbarBrand as={Link} href="/" className="max-w-fit">
          <Image
            src="/logo.png"
            alt="Logo"
            width={60}
            height={40}
            className={`w-10 md:w-12 lg:w-16 max-lg:object-contain !transition-all duration-300 ${
              isFocused ? "!w-0 overflow-hidden" : ""
            } hover:scale-[1.04]`}
          />
        </NavbarBrand>
        <NavbarItem
          className={`flex-1 !transition-all duration-300 ${
            isFocused ? "w-full" : "w-auto"
          }`}
        >
          <Search isFocused={isFocused} setIsFocused={setIsFocused} />
        </NavbarItem>
        <NavbarContent
          className={`max-w-fit max-lg:hidden transition-all duration-300 ${
            isFocused ? "flex-shrink" : ""
          }`}
        >
          <NavMenuItems />
        </NavbarContent>
      </NavbarContent>
      <NavbarContent
        justify="end"
        className={`max-w-fit gap-2 !transition-all duration-300`}
      >
        <UserNavItems
          configData={configData}
          isMenuOpen={isMenuOpen}
          username={username || ""}
          userType={userType as UserType}
        />
      </NavbarContent>
      <MobileMenu
        setIsMenuOpen={setIsMenuOpen}
        isSignedIn={isSignedIn}
        username={username}
        userType={userType}
        configData={configData}
      />
    </Navbar>
  );
};

export default Header;
