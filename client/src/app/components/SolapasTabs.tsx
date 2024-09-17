"use client";

import { Tab, Tabs } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import PostsList from "../(root)/anuncios/PostsList";
import UsersList from "../(root)/usuarios/page";

const SolapasTabs = () => {
  const pathname = usePathname();
    
  return (
    <Tabs aria-label="Options" selectedKey={pathname}>
      <Tab key="/anuncios" title="Photos" href="/anuncios">
        <PostsList />
      </Tab>
      <Tab key="/usuarios" title="Music" href="/usuarios">
        <UsersList />
      </Tab>
    </Tabs>
  );
};

export default SolapasTabs;
