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

const SolapasTabs = ({
  usernameUserLogged,
  idUserLogged,
}: {
  usernameUserLogged?: string | null;
  idUserLogged?: string;
}) => {
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
        key={`${POSTS}${postTypeUrlVisited}`}
        title="Recomendados"
        href={`${POSTS}${postTypeUrlVisited}`}
        data-key={`${POSTS}${postTypeUrlVisited}`}
      >
        <PostsList postTypeVisited={postTypeVisited} />
      </Tab>
      <Tab
        className="w-full"
        key={`${POST_RECENTS}${postTypeUrlVisited}`}
        title="Anuncios de Hoy"
        href={`${POST_RECENTS}${postTypeUrlVisited}`}
        data-key={`${POST_RECENTS}${postTypeUrlVisited}`}
      >
        <PostsList postTypeVisited={postTypeVisited} />
      </Tab>
      <Tab
        className="w-full"
        key={`${POST_BEST}${postTypeUrlVisited}`}
        title="Mejor Puntuados"
        href={`${POST_BEST}${postTypeUrlVisited}`}
        data-key={`${POST_BEST}${postTypeUrlVisited}`}
      >
        <PostsList postTypeVisited={postTypeVisited} />
      </Tab>
      <Tab
        className="w-full"
        key={`${POST_NEXT_TO_EXPIRE}${postTypeUrlVisited}`}
        title="Próximos a Vencer"
        href={`${POST_NEXT_TO_EXPIRE}${postTypeUrlVisited}`}
        data-key={`${POST_NEXT_TO_EXPIRE}${postTypeUrlVisited}`}
      >
        <PostsList postTypeVisited={postTypeVisited} />
      </Tab>
      <Tab
        className="w-full"
        key={BOARDS}
        title="Pizarras"
        href={BOARDS}
        data-key={BOARDS}
      >
        <BoardsLogic username={usernameUserLogged} />
      </Tab>
      <Tab
        className="w-full"
        key={PROFILE}
        title="Perfiles"
        href={PROFILE}
        data-key={PROFILE}
      >
        <UsersLogic
          userLogged={{
            username: usernameUserLogged || "",
            _id: idUserLogged as string,
          }}
        />
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
