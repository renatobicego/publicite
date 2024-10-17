"use client";

import { MAGAZINES, GROUPS, CREATE_MAGAZINE } from "@/utils/data/urls";
import { Group, User } from "@/types/userTypes";
import { Link, Tab, Tabs } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import MagazinesGrid from "../grids/MagazinesGrid";
import PostListLogic from "@/app/(root)/(explorar)/anuncios/components/PostListLogic";
import { Magazine } from "@/types/postTypes";
import UsersGrid from "@/app/(root)/(explorar)/perfiles/UsersGrid";
import InviteUsersGroup from "../modals/InviteUsersGroup";
import PrimaryButton from "../buttons/PrimaryButton";
import { FaPlus } from "react-icons/fa6";
const GroupSolapas = ({
  group,
  isAdmin,
}: {
  group: Group;
  isAdmin: boolean;
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

  const GROUP_URL = `${GROUPS}/${group._id}`;

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
        className="w-full flex gap-4 flex-col"
        key={GROUP_URL}
        title="Anuncios del Grupo"
        href={GROUP_URL}
        data-key={GROUP_URL} // Use a data attribute to identify the tab
      >
        <h3>Anuncios de Miembros del Grupo</h3>
        <PostListLogic postType="groupPosts" groupId={group._id} />
      </Tab>
      <Tab
        className="w-full flex gap-4 flex-col"
        key={`${GROUP_URL}${MAGAZINES}`}
        title="Revistas del Grupo"
        href={`${GROUP_URL}${MAGAZINES}`}
        data-key={`${GROUP_URL}${MAGAZINES}`}
      >
        <div className="w-full flex justify-between items-center">
          <h3>Revistas del Grupo</h3>
          {isAdmin && (
            <PrimaryButton
              as={Link}
              startContent={<FaPlus />}
              href={`${CREATE_MAGAZINE}/grupos/${group._id}`}
            >
              Crear Revista
            </PrimaryButton>
          )}
        </div>
        <MagazinesGrid magazines={group.magazines as Magazine[]} />
      </Tab>
      <Tab
        className={`w-full flex gap-4 flex-col ${isAdmin ? "" : "hidden"}`}
        key={`${GROUP_URL}/miembros`}
        title="Administrar Miembros"
        href={`${GROUP_URL}/miembros`}
        data-key={`${GROUP_URL}/miembros`}
      >
        <div className="w-full flex justify-between items-center">
          <h3>Miembros del Grupo</h3>
          <InviteUsersGroup />
        </div>
        <UsersGrid
          items={group.members as User[]}
          groupGrid
          group={group}
        />
      </Tab>
    </Tabs>
  );
};

export default GroupSolapas;
