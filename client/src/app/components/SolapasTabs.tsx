"use client";

import { Tab, Tabs } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import PostsList from "../(root)/anuncios/PostsList";
import UsersList from "../(root)/perfiles/UsersList";
import {
  BOARDS,
  POST_BEST,
  POST_NEXT_TO_EXPIRE,
  POST_RECENTS,
  POSTS,
  PROFILE,
} from "../utils/data/urls";
import BoardsLogic from "../(root)/pizarras/BoardsLogic";

const SolapasTabs = () => {
  const pathname = usePathname();

  return (
    <Tabs aria-label="Options" variant="underlined" selectedKey={pathname}>
      <Tab className="w-full" key={POSTS} title="Recomendados" href={POSTS}>
        <PostsList />
      </Tab>
      <Tab
        className="w-full"
        key={POST_RECENTS}
        title="Anuncios de Hoy"
        href={POST_RECENTS}
      >
        <PostsList />
      </Tab>
      <Tab
        className="w-full"
        key={POST_BEST}
        title="Mejor Puntuados"
        href={POST_BEST}
      >
        <PostsList />
      </Tab>
      <Tab
        className="w-full"
        key={POST_NEXT_TO_EXPIRE}
        title="Próximos a Vencer"
        href={POST_NEXT_TO_EXPIRE}
      >
        <PostsList />
      </Tab>
      <Tab className="w-full" key={BOARDS} title="Pizarras" href={BOARDS}>
        <BoardsLogic />
      </Tab>
      <Tab className="w-full" key={PROFILE} title="Perfiles" href={PROFILE}>
        <UsersList />
      </Tab>
    </Tabs>
  );
};

export default SolapasTabs;
