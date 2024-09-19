"use client";

import { Tab, Tabs } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import PostsList from "../(root)/anuncios/PostsList";
import UsersList from "../(root)/usuarios/UsersList";
import { POSTS } from "../utils/data/urls";

const SolapasTabs = () => {
  const pathname = usePathname();
    
  return (
    <Tabs aria-label="Options" variant="underlined" selectedKey={pathname}>
      <Tab className="w-full" key={POSTS} title="Recomendados" href={POSTS}>
        <PostsList />
      </Tab>
      <Tab key={`${POSTS}/recientes`} title="Anuncios de Hoy" href={`${POSTS}/recientes`}>
        <PostsList />
      </Tab>
      <Tab key={`${POSTS}/mejor-puntuados`} title="Mejor Puntuados" href={`${POSTS}/mejor-puntuados`}>
        <PostsList />
      </Tab>
      <Tab key={`${POSTS}/proximos-a-vencer`} title="Próximos a Vencer" href={`${POSTS}/proximos-a-vencer`}>
        <PostsList />
      </Tab>
      <Tab key="/usuarios" title="Music" href="/usuarios">
        <UsersList />
      </Tab>
    </Tabs>
  );
};

export default SolapasTabs;
