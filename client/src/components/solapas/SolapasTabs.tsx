"use client";

import PostsList from "@/app/(root)/(explorar)/anuncios/components/PostsList";
import GroupsLogic from "@/app/(root)/(explorar)/grupos/GroupsLogic";
import UsersLogic from "@/app/(root)/(explorar)/perfiles/UsersLogic";
import BoardsLogic from "@/app/(root)/(explorar)/pizarras/BoardsLogic";
import {
  POSTS,
  POST_RECENTS,
  POST_BEST,
  POST_NEXT_TO_EXPIRE,
  BOARDS,
  PROFILE,
  GROUPS,
} from "@/utils/data/urls";
import { Tab, Tabs } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const SolapasTabs = () => {
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

  return (
    <Tabs
      classNames={{
        panel: "p-0",
        tabList: "max-md:gap-0 p-0",
        tab: "max-md:text-xs",
        tabContent: "max-md:text-xs",
        base: "max-w-full overflow-x-auto", 
      }}
      ref={tabsRef} 
      aria-label="Options"
      variant="underlined"
      selectedKey={pathname}
    >
      <Tab
        className="w-full"
        key={POSTS}
        title="Recomendados"
        href={POSTS}
        data-key={POSTS}
      >
        <PostsList />
      </Tab>
      <Tab
        className="w-full"
        key={POST_RECENTS}
        title="Anuncios de Hoy"
        href={POST_RECENTS}
        data-key={POST_RECENTS}
      >
        <PostsList />
      </Tab>
      <Tab
        className="w-full"
        key={POST_BEST}
        title="Mejor Puntuados"
        href={POST_BEST}
        data-key={POST_BEST}
      >
        <PostsList />
      </Tab>
      <Tab
        className="w-full"
        key={POST_NEXT_TO_EXPIRE}
        title="Próximos a Vencer"
        href={POST_NEXT_TO_EXPIRE}
        data-key={POST_NEXT_TO_EXPIRE}
      >
        <PostsList />
      </Tab>
      <Tab
        className="w-full"
        key={BOARDS}
        title="Pizarras"
        href={BOARDS}
        data-key={BOARDS}
      >
        <BoardsLogic />
      </Tab>
      <Tab
        className="w-full"
        key={PROFILE}
        title="Perfiles"
        href={PROFILE}
        data-key={PROFILE}
      >
        <UsersLogic />
      </Tab>
      <Tab
        className="w-full"
        key={GROUPS}
        title="Grupos"
        href={GROUPS}
        data-key={GROUPS}
      >
        <GroupsLogic />
      </Tab>
    </Tabs>
  );
};

export default SolapasTabs;
