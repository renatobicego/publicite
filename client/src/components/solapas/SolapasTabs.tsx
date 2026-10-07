"use client";

import PostsList from "@/app/(root)/(explorar)/anuncios/components/PostsList";
import ProductionsLogic from "@/app/(root)/(explorar)/producciones/ProductionsLogic";
import GroupsLogic from "@/app/(root)/(explorar)/grupos/GroupsLogic";
import UsersLogic from "@/app/(root)/(explorar)/perfiles/UsersLogic";
import BoardsLogic from "@/app/(root)/(explorar)/pizarras/BoardsLogic";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { PostsDataTypes } from "@/utils/data/fetchDataByType";
import {
  POSTS,
  POST_RECENTS,
  POST_BEST,
  POST_NEXT_TO_EXPIRE,
  BOARDS,
  PROFILE,
  GROUPS,
  POST_CONTACTS,
  POST_LIBRE,
  PRODUCTIONS,
} from "@/utils/data/urls";
import { Tab, Tabs } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import TabTitle from "./TabTitle";
import { FaLocationDot, FaUser, FaUserGroup } from "react-icons/fa6";
import { IoMdMegaphone } from "react-icons/io";
import {
  FaBook,
  FaBullhorn,
  FaChalkboardTeacher,
  FaUsers,
} from "react-icons/fa";
import NextLink from "next/link";

const SolapasTabs = () => {
  const pathname = usePathname();
  const { userIdLogged } = useUserData();
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

  const getPostType = (): PostsDataTypes => {
    const postTypeVisited: PostsDataTypes = {
      postType: "all",
      typeOfData: "posts",
    };
    switch (true) {
      case pathname.includes(`${POST_RECENTS}`):
        postTypeVisited.typeOfData = "posts";
        break;
      case pathname.includes(`${POST_BEST}`):
        postTypeVisited.typeOfData = "posts";
        break;
      case pathname.includes(`${POST_NEXT_TO_EXPIRE}`):
        postTypeVisited.typeOfData = "posts";
        break;
      case pathname.includes(`${POST_CONTACTS}`):
        (postTypeVisited as PostsDataTypes).typeOfData = "contactPosts";
        if (pathname === `${POST_CONTACTS}`) {
          postTypeVisited.postType = "all";
        }
        break;
      case pathname.includes(POST_LIBRE):
        postTypeVisited.typeOfData = "posts";
        break;
      case pathname.includes(POSTS):
        postTypeVisited.typeOfData = "posts";
        break;
    }
    switch (true) {
      case pathname.includes("servicios"):
        postTypeVisited.postType = "service";
        break;
      case pathname.includes("necesidades"):
        postTypeVisited.postType = "petition";
        break;
      case pathname.includes("bienes"):
        postTypeVisited.postType = "good";
        break;
      case pathname.includes(POST_LIBRE):
        postTypeVisited.postType = "libre";
        break;
      default:
        postTypeVisited.postType = "all";
        break;
    }
    return postTypeVisited;
  };
  const postTypeVisited = getPostType();

  const postTypeUrlVisited =
    "postType" in postTypeVisited
      ? postTypeVisited.postType === "petition"
        ? "/necesidades"
        : postTypeVisited.postType === "service"
          ? "/servicios"
          : postTypeVisited.postType === "good"
            ? "/bienes"
            : ""
      : "";

  // Sub-solapas de "Anuncios": anuncios, anuncios libres y agenda de contactos.
  const postsSubTabs = [
    {
      key: `${POSTS}${postTypeUrlVisited}`,
      title: (
        <TabTitle
          title="Anuncios"
          icon={
            <>
              <IoMdMegaphone className="size-5 md:size-6 " />
            </>
          }
        />
      ),
      component: <PostsList postTypeVisited={postTypeVisited} />,
    },
    {
      key: `${POST_LIBRE}${postTypeUrlVisited}`,
      title: (
        <TabTitle
          title="Anuncios Libres"
          icon={
            <>
              <FaLocationDot className="size-5 md:size-6 " />{" "}
              <IoMdMegaphone className="size-5 md:size-6 " />
            </>
          }
        />
      ),
      component: <PostsList postTypeVisited={postTypeVisited} />,
    },
    {
      key: `${POST_CONTACTS}${postTypeUrlVisited}`,
      title: (
        <TabTitle
          title="Agenda de Contactos"
          icon={
            <>
              <FaUser className="size-5 md:size-6 " />{" "}
              <IoMdMegaphone className="size-5 md:size-6 " />
            </>
          }
        />
      ),
      component: <PostsList postTypeVisited={postTypeVisited} hideMap />,
      requiresLogin: true,
    },
    // {
    //   key: `${POST_RECENTS}${postTypeUrlVisited}`,
    //   title: "Anuncios de Hoy",
    //   component: <PostsList postTypeVisited={postTypeVisited} />,
    // },
    // {
    //   key: `${POST_BEST}${postTypeUrlVisited}`,
    //   title: "Mejor Puntuados",
    //   component: <PostsList postTypeVisited={postTypeVisited} />,
    // },
    // {
    //   key: `${POST_NEXT_TO_EXPIRE}${postTypeUrlVisited}`,
    //   title: "Próximos a Vencer",
    //   component: <PostsList postTypeVisited={postTypeVisited} />,
    // },
  ];

  // Sub-solapas de "Social": pizarras, carteles de usuario y grupos.
  const socialSubTabs = [
    {
      key: BOARDS,
      title: <TabTitle title="Pizarras" icon={<FaChalkboardTeacher />} />,
      component: <BoardsLogic />,
      requiresLogin: true,
    },
    {
      key: PROFILE,
      title: <TabTitle title="Carteles de Usuario" icon={<FaUser />} />,
      component: <UsersLogic />,
      requiresLogin: true,
    },
    {
      key: GROUPS,
      title: <TabTitle title="Grupos" icon={<FaUserGroup />} />,
      component: <GroupsLogic />,
      requiresLogin: true,
    },
  ];

  // Filter out tabs that require login if the user is not logged in
  const filterByLogin = <T extends { requiresLogin?: boolean }>(tabs: T[]) =>
    tabs.filter((tab) => !tab.requiresLogin || userIdLogged);

  const renderSubTabs = (
    subTabs: typeof postsSubTabs,
    ariaLabel: string
  ) => (
    <Tabs
      classNames={{
        panel: "p-0",
        tabList: "max-md:gap-0 p-0",
        tab: "max-md:text-xs",
        tabContent: "max-md:text-xs",
        base: "max-w-full overflow-x-auto",
      }}
      aria-label={ariaLabel}
      variant="underlined"
      selectedKey={pathname}
    >
      {subTabs.map((tab) => (
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

  const visiblePostsSubTabs = filterByLogin(postsSubTabs);
  const visibleSocialSubTabs = filterByLogin(socialSubTabs);

  const isProductionsActive = pathname === PRODUCTIONS;
  const isSocialActive = visibleSocialSubTabs.some(
    (tab) => tab.key === pathname
  );

  // Colores de las cards de nivel superior.
  const ORANGE = "#F0931A";
  const MAGENTA = "#8B008B";
  const CYAN = "#1ACCF0";

  // Solapas de nivel superior: Anuncios / Producciones / Social.
  const topTabs = [
    {
      id: "anuncios",
      // Si ya estamos en Anuncios, la card mantiene la sub-solapa activa.
      href: !isProductionsActive && !isSocialActive ? pathname : POSTS,
      label: "Anuncios",
      icon: FaBullhorn,
      color: ORANGE,
      isActive: !isProductionsActive && !isSocialActive,
      component: renderSubTabs(visiblePostsSubTabs, "Anuncios"),
    },
    {
      id: "producciones",
      href: PRODUCTIONS,
      label: "Producciones",
      icon: FaBook,
      color: MAGENTA,
      isActive: isProductionsActive,
      component: <ProductionsLogic />,
    },
    {
      // "Social" agrupa las sub-solapas. Navega a la sub-solapa activa.
      id: "social",
      // Sin sesión, la card se muestra igual pero lleva al login.
      href: !userIdLogged
        ? "/iniciar-sesion"
        : isSocialActive
          ? pathname
          : BOARDS,
      label: "Social",
      icon: FaUsers,
      color: CYAN,
      isActive: isSocialActive,
      component: renderSubTabs(visibleSocialSubTabs, "Social"),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Botonera de 3 cards: Anuncios / Producciones / Social */}
      <nav className="flex w-full gap-3 sm:gap-4" aria-label="Aplicaciones">
        {topTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <div key={tab.id} className="flex flex-1 flex-col gap-2">
              <NextLink
                href={tab.href}
                aria-current={tab.isActive ? "page" : undefined}
                style={{ backgroundColor: tab.color }}
                className="flex h-[18vh] flex-col justify-end rounded-2xl p-4 text-white transition-transform hover:scale-[1.02]"
              >
                <Icon className="mb-2 text-2xl md:text-3xl xl:text-4xl" />
                <span className="text-base font-bold md:text-lg xl:text-xl 3xl:text-2xl">
                  {tab.label}
                </span>
              </NextLink>
              <span
                className="h-1 rounded-full transition-colors"
                style={{
                  backgroundColor: tab.isActive ? tab.color : "transparent",
                }}
              />
            </div>
          );
        })}
      </nav>

      {/* Contenido de la solapa activa */}
      <div ref={tabsRef} className="w-full flex gap-4 flex-col">
        {topTabs.find((tab) => tab.isActive)?.component}
      </div>
    </div>
  );
};

export default SolapasTabs;
