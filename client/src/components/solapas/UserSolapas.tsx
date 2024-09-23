"use client";

import {
  PROFILE,
  MAGAZINES,
  GROUPS,
} from "@/utils/data/urls";
import { GetUser, User } from "@/types/userTypes";
import { Tab, Tabs } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import PostsGrid from "../grids/PostGrid";
import MagazinesGrid from "../grids/MagazinesGrid";
import UsersGrid from "@/app/(root)/(explorar)/perfiles/UsersGrid";
import GroupsGrid from "@/app/(root)/(explorar)/grupos/GroupsGrid";

const UserSolapas = ({user} : {user: GetUser}) => {
  const pathname = usePathname();
  const tabsRef = useRef<HTMLDivElement | null>(null);

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

  const PROFILE_USERNAME = `${PROFILE}/${user.username}`

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
        <PostsGrid posts={user.posts} />
      </Tab>
      <Tab
        className="w-full"
        key={`${PROFILE_USERNAME}${MAGAZINES}`}
        title="Revistas"
        href={`${PROFILE_USERNAME}${MAGAZINES}`}
        data-key={`${PROFILE_USERNAME}${MAGAZINES}`}
      >
        <MagazinesGrid magazines={user.magazines} username={user.username}/>
      </Tab>
      <Tab
        className="w-full"
        key={`${PROFILE_USERNAME}/contactos`}
        title="Contactos"
        href={`${PROFILE_USERNAME}/contactos`}
        data-key={`${PROFILE_USERNAME}/contactos`}
      >
        <UsersGrid items={user.userRelations} />
      </Tab>
      <Tab
        className="w-full"
        key={`${PROFILE_USERNAME}${GROUPS}`}
        title="Grupos"
        href={`${PROFILE_USERNAME}${GROUPS}`}
        data-key={`${PROFILE_USERNAME}${GROUPS}`}
      >
        <GroupsGrid items={user.groups} />
      </Tab>
    </Tabs>
  );
};

export default UserSolapas;
