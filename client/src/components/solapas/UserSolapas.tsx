"use client";

import {
  PROFILE,
  MAGAZINES,
  GROUPS,
  CREATE,
  CREATE_MAGAZINE,
  CREATE_GROUP,
} from "@/utils/data/urls";
import { GetUser, UserRelationNotification } from "@/types/userTypes";
import { Link, Tab, Tabs } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import MagazinesGrid from "../grids/MagazinesGrid";
import GroupsGrid from "@/app/(root)/(explorar)/grupos/GroupsGrid";
import PrimaryButton from "../buttons/PrimaryButton";
import { FaPlus } from "react-icons/fa6";
import UserPosts from "@/app/(root)/(explorar)/perfiles/[id]/(components)/UserPosts/UserPosts";
import UserRelationRequestsGrid from "@/app/(root)/(explorar)/perfiles/[id]/(components)/UserRelations/UserRelationRequestsGrid";
import UserRelations from "@/app/(root)/(explorar)/perfiles/[id]/(components)/UserRelations/UserRelations";
import {
  useConfigData,
  useUserData,
} from "@/app/(root)/providers/userDataProvider";

const UserSolapas = ({
  user,
  isMyProfile,
  friendRequests = [],
}: {
  user: GetUser;
  isMyProfile: boolean;
  friendRequests?: UserRelationNotification[];
}) => {
  const pathname = usePathname();
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const { configData } = useConfigData();
  const { userIdLogged } = useUserData();

  const isActiveRelation =
    isMyProfile ||
    configData?.activeRelations.some(
      (relation) => relation.userA === user._id || relation.userB === user._id
    );

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

  if (!isActiveRelation) {
    return (
      <p>
        No puedes ver las publicaciones de este cartel de usuario porque no es
        una relación activa. Para gestionar tus relaciones activas, ve a tu{" "}
        <Link
          className="text-primary"
          href={`${PROFILE}/${userIdLogged}/contactos`}
        >
          perfil
        </Link>
      </p>
    );
  }

  const PROFILE_USERNAME = `${PROFILE}/${user._id}`;

  const tabDefinitions = [
    {
      key: `${PROFILE_USERNAME}`,
      title: "Anuncios",
      component: (
        <>
          {isMyProfile && (
            <PrimaryButton
              className="mb-2 md:self-start"
              startContent={<FaPlus />}
              as={Link}
              href={CREATE}
            >
              Crear Anuncio
            </PrimaryButton>
          )}
          <UserPosts isMyProfile={isMyProfile} posts={user.posts || []} />
        </>
      ),
    },
    {
      key: `${PROFILE_USERNAME}${MAGAZINES}`,
      title: "Revistas",
      component: (
        <>
          {isMyProfile && (
            <PrimaryButton
              className="mb-2 md:self-start"
              startContent={<FaPlus />}
              as={Link}
              href={CREATE_MAGAZINE}
            >
              Crear Revista
            </PrimaryButton>
          )}
          <MagazinesGrid magazines={user.magazines} />
        </>
      ),
    },
    {
      key: `${PROFILE_USERNAME}/contactos`,
      title: "Agenda de Contactos",
      component: (
        <UserRelations
          user={{ _id: user._id, userRelations: user.userRelations }}
          isMyProfile={isMyProfile}
        />
      ),
    },
    {
      key: `${PROFILE_USERNAME}${GROUPS}`,
      title: "Grupos",
      component: (
        <>
          {isMyProfile && (
            <PrimaryButton
              className="mb-2 md:self-start"
              startContent={<FaPlus />}
              as={Link}
              href={CREATE_GROUP}
            >
              Crear Grupo
            </PrimaryButton>
          )}
          <GroupsGrid
            items={user.groups.map((group) => ({
              group,
              isMember: false,
              hasGroupRequest: false,
              hasJoinRequest: false,
              isUserProfile: true,
            }))}
            isUserProfile
          />
        </>
      ),
    },
    {
      key: `${PROFILE_USERNAME}/solicitudes`,
      title: "Administrar Solicitudes",
      component: <UserRelationRequestsGrid items={friendRequests} />,
      requiredProfile: true,
    },
  ];

  // Filter out tabs that require login if the user is not logged in
  const filteredTabs = tabDefinitions.filter(
    (tab) => !tab.requiredProfile || (tab.requiredProfile && isMyProfile)
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
      id="user-tabs"
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

export default UserSolapas;
