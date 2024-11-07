"use client";

import PostsList from "@/app/(root)/(explorar)/anuncios/components/PostsList";
import GroupsLogic from "@/app/(root)/(explorar)/grupos/GroupsLogic";
import UsersLogic from "@/app/(root)/(explorar)/perfiles/UsersLogic";
import BoardsLogic from "@/app/(root)/(explorar)/pizarras/BoardsLogic";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
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
  const {userIdLogged} = useUserData();
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

  const getPostType = () => {
    switch (true) {
      case pathname.includes("servicios"):
        return "service";
      case pathname.includes("necesidades"):
        return "petition";
      default:
        return "good";
    }
  };
  const postTypeVisited = getPostType();

  const postTypeUrlVisited =
    postTypeVisited === "petition"
      ? "/necesidades"
      : postTypeVisited === "service"
      ? "/servicios"
        : "";
  
  // Array of tab definitions
  const tabDefinitions = [
    {
      key: `${POSTS}${postTypeUrlVisited}`,
      title: "Recomendados",
      component: <PostsList postTypeVisited={postTypeVisited} />,
    },
    {
      key: `${POST_RECENTS}${postTypeUrlVisited}`,
      title: "Anuncios de Hoy",
      component: <PostsList postTypeVisited={postTypeVisited} />,
    },
    {
      key: `${POST_BEST}${postTypeUrlVisited}`,
      title: "Mejor Puntuados",
      component: <PostsList postTypeVisited={postTypeVisited} />,
    },
    {
      key: `${POST_NEXT_TO_EXPIRE}${postTypeUrlVisited}`,
      title: "Próximos a Vencer",
      component: <PostsList postTypeVisited={postTypeVisited} />,
    },
    {
      key: BOARDS,
      title: "Pizarras",
      component: <BoardsLogic />,
      requiresLogin: true,
    },
    {
      key: PROFILE,
      title: "Perfiles",
      component: (
        <UsersLogic />
      ),
      requiresLogin: true,
    },
    {
      key: GROUPS,
      title: "Grupos",
      component: <GroupsLogic />,
      requiresLogin: true,
    },
  ];

  // Filter out tabs that require login if the user is not logged in
  const filteredTabs = tabDefinitions.filter(
    (tab) => !tab.requiresLogin || (tab.requiresLogin && userIdLogged)
  );

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
      {filteredTabs.map((tab) => (
        <Tab
          className="w-full"
          key={tab.key}
          title={tab.title}
          href={tab.key}
          data-key={tab.key}
        >
          {tab.component}
        </Tab>
      ))}
    </Tabs>
  );
};

export default SolapasTabs;
