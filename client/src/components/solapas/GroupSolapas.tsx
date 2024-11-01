"use client";

import { MAGAZINES, GROUPS, CREATE_MAGAZINE } from "@/utils/data/urls";
import { Group, GroupAdmin } from "@/types/groupTypes";
import { Link, Tab, Tabs } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import MagazinesGrid from "../grids/MagazinesGrid";
import PostListLogic from "@/app/(root)/(explorar)/anuncios/components/PostListLogic";
import { Magazine } from "@/types/magazineTypes";
import UsersGrid from "@/app/(root)/(explorar)/perfiles/UsersGrid";
import InviteUsersGroup from "../modals/InvitationModal/InviteUsersGroup";
import PrimaryButton from "../buttons/PrimaryButton";
import { FaPlus } from "react-icons/fa6";
import { User } from "@/types/userTypes";
import { useRouter } from "next-nprogress-bar";
import { useUserData } from "@/app/(root)/userDataProvider";
const GroupSolapas = ({
  group,
  isAdmin,
}: {
  group: GroupAdmin;
  isAdmin: boolean;
}) => {
  const pathname = usePathname();
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { userIdLogged } = useUserData();

  useEffect(() => {
    if (
      (pathname.includes("miembros") || pathname.includes("solicitudes")) &&
      !isAdmin
    ) {
      router.push(`${GROUPS}/${group._id}`);
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const GROUP_URL = `${GROUPS}/${group._id}`;

  const tabDefinitions = [
    {
      key: `${GROUP_URL}`,
      title: "Anuncios del Grupo",
      component: (
        <>
          <h3>Anuncios de Miembros del Grupo</h3>
          <PostListLogic postType="groupPosts" groupId={group._id} />
        </>
      ),
    },
    {
      key: `${GROUP_URL}${MAGAZINES}`,
      title: "Revistas del Grupo",
      component: (
        <>
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
        </>
      ),
    },
    {
      key: `${GROUP_URL}/miembros`,
      title: "Administrar Miembros",
      component: (
        <>
          <div className="w-full flex justify-between items-center">
            <h3>Miembros del Grupo</h3>
            <InviteUsersGroup group={group} />
          </div>
          <UsersGrid
            items={(group.members as User[]).filter(
              (member) => member._id !== userIdLogged
            )}
            groupGrid
            group={group}
          />
        </>
      ),
      requiredAdmin: true,
    },
    {
      key: `${GROUP_URL}/solicitudes`,
      title: "Administrar Solicitudes",
      component: (
        <>
          <div className="w-full flex justify-between items-center">
            <h3>Solicitudes de Ingreso</h3>
          </div>
          {!group.groupNotificationsRequest ||
          !group.groupNotificationsRequest.joinRequests ||
          group.groupNotificationsRequest.joinRequests.length === 0 ? (
            <p className="text-light-text">No hay solicitudes de ingreso</p>
          ) : (
            <UsersGrid
              items={group.groupNotificationsRequest.joinRequests as User[]}
              groupGrid
              group={group}
              groupRequestGrid
            />
          )}
        </>
      ),
      requiredAdmin: true,
    },
  ];

  // Filter out tabs that require login if the user is not logged in
  const filteredTabs = tabDefinitions.filter(
    (tab) => !tab.requiredAdmin || (tab.requiredAdmin && isAdmin)
  );

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
      {filteredTabs.map((tab) => (
        <Tab
          className="w-full flex gap-4 flex-col"
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

export default GroupSolapas;
