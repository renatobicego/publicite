"use client";

import { PROFILE, MAGAZINES, GROUPS, CREATE } from "@/utils/data/urls";
import { GetUser } from "@/types/userTypes";
import { Link, Tab, Tabs } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import MagazinesGrid from "../grids/MagazinesGrid";
import UsersGrid from "@/app/(root)/(explorar)/perfiles/UsersGrid";
import GroupsGrid from "@/app/(root)/(explorar)/grupos/GroupsGrid";
import PrimaryButton from "../buttons/PrimaryButton";
import { FaPlus } from "react-icons/fa6";
import { useUser } from "@clerk/nextjs";
import UserPosts from "@/app/(root)/(explorar)/perfiles/[username]/(components)/UserPosts/UserPosts";
import { User } from "@clerk/nextjs/server";

const UserSolapas = ({
  user,
  loggedUser,
}: {
  user: GetUser;
  loggedUser: {
    username: string;
    _id: string;
  };
}) => {
  const pathname = usePathname();
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const isMyProfile = loggedUser && user.username === loggedUser.username;

  useEffect(() => {
    if (tabsRef.current) {
      // Find the active tab using a data attribute or class
      const activeTab = tabsRef.current.querySelector(
        `[data-key="${pathname}"]`
      ) as HTMLElement;

      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [pathname]);

  const PROFILE_USERNAME = `${PROFILE}/${user.username}`;

  return (
    <Tabs
      classNames={{
        panel: "p-0",
        tabList: "max-md:gap-0 p-0",
        tab: "max-md:text-xs",
        tabContent: "max-md:text-xs",
        base: "max-w-full overflow-x-auto", // Horizontal scroll enabled
      }}
      ref={tabsRef} // Ref for the entire tabs container
      aria-label="Options"
      variant="underlined"
      selectedKey={pathname}
    >
      <Tab
        className="w-full"
        key={PROFILE_USERNAME}
        title="Anuncios"
        href={PROFILE_USERNAME}
        data-key={PROFILE_USERNAME} // Use a data attribute to identify the tab
      >
        {isMyProfile && (
          <PrimaryButton
            className="mb-2 md:ml-2 md:float-right"
            startContent={<FaPlus />}
            as={Link}
            href={CREATE}
          >
            Crear
          </PrimaryButton>
        )}
        <UserPosts posts={user.posts || []} />
      </Tab>
      <Tab
        className="w-full"
        key={`${PROFILE_USERNAME}${MAGAZINES}`}
        title="Revistas"
        href={`${PROFILE_USERNAME}${MAGAZINES}`}
        data-key={`${PROFILE_USERNAME}${MAGAZINES}`}
      >
        <PrimaryButton
          className="mb-2 md:float-right"
          startContent={<FaPlus />}
          as={Link}
          href={CREATE}
        >
          Crear
        </PrimaryButton>
        <MagazinesGrid magazines={user.magazines} />
      </Tab>
      <Tab
        className="w-full"
        key={`${PROFILE_USERNAME}/contactos`}
        title="Contactos"
        href={`${PROFILE_USERNAME}/contactos`}
        data-key={`${PROFILE_USERNAME}/contactos`}
      >
        {isMyProfile && (
          <PrimaryButton
            className="mb-2 md:float-right"
            startContent={<FaPlus />}
            as={Link}
            href={PROFILE}
          >
            Agregar Contactos
          </PrimaryButton>
        )}
        <UsersGrid
          items={user.userRelations}
          userLogged={{
            username: loggedUser.username as string,
            _id: loggedUser._id,
          }}
        />
      </Tab>
      <Tab
        className="w-full"
        key={`${PROFILE_USERNAME}${GROUPS}`}
        title="Grupos"
        href={`${PROFILE_USERNAME}${GROUPS}`}
        data-key={`${PROFILE_USERNAME}${GROUPS}`}
      >
        {isMyProfile && (
          <PrimaryButton
            className="mb-2 md:float-right"
            startContent={<FaPlus />}
            as={Link}
            href={CREATE}
          >
            Crear
          </PrimaryButton>
        )}
        <GroupsGrid items={user.groups} />
      </Tab>
    </Tabs>
  );
};

export default UserSolapas;
