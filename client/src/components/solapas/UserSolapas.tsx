"use client";

import {
  PROFILE,
  MAGAZINES,
  GROUPS,
  CREATE,
  CREATE_MAGAZINE,
  CREATE_GROUP,
  POST_SEUDOBASE,
} from "@/utils/data/urls";
import { GetUser, UserRelationNotification } from "@/types/userTypes";
import { Link, Tab, Tabs, useDisclosure } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import MagazinesGrid from "../grids/MagazinesGrid";
import GroupsGrid from "@/app/(root)/(explorar)/grupos/GroupsGrid";
import PrimaryButton from "../buttons/PrimaryButton";
import SecondaryButton from "../buttons/SecondaryButton";
import { FaPlus, FaUserGroup } from "react-icons/fa6";
import UserPosts from "@/app/(root)/(explorar)/perfiles/[id]/(components)/UserPosts/UserPosts";
import UserRelationRequestsGrid from "@/app/(root)/(explorar)/perfiles/[id]/(components)/UserRelations/UserRelationRequestsGrid";
import UserRelations from "@/app/(root)/(explorar)/perfiles/[id]/(components)/UserRelations/UserRelations";
import {
  useConfigData,
  useUserData,
} from "@/app/(root)/providers/userDataProvider";
import { IoMdMegaphone } from "react-icons/io";
import { FaBook, FaBookmark, FaChartPie, FaTable, FaUserPlus, FaUsers } from "react-icons/fa";
import TabTitle from "./TabTitle";
import { MdContacts } from "react-icons/md";
import ProfileProductionsTab from "@/app/(root)/(explorar)/perfiles/[id]/(components)/ProfileProductionsTab";
import ConsumptionControlModal from "./ConsumptionControlModal";

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
  const consumptionModal = useDisclosure();

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

  // Rutas de cada sección
  const ANUNCIOS_KEY = `${PROFILE_USERNAME}`;
  const PRODUCCIONES_KEY = `${PROFILE_USERNAME}/producciones`;
  const REVISTAS_KEY = `${PROFILE_USERNAME}${MAGAZINES}`;
  const CONTACTOS_KEY = `${PROFILE_USERNAME}/contactos`;
  const GRUPOS_KEY = `${PROFILE_USERNAME}${GROUPS}`;
  const SOLICITUDES_KEY = `${PROFILE_USERNAME}/solicitudes`;

  // Sub-solapas de "Social": revistas, grupos, contactos y solicitudes.
  const socialSubTabs = [
    {
      key: REVISTAS_KEY,
      title: <TabTitle title="Revistas" icon={<FaBookmark />} />,
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
      key: GRUPOS_KEY,
      title: <TabTitle title="Grupos" icon={<FaUserGroup />} />,
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
      key: CONTACTOS_KEY,
      title: <TabTitle title="Agenda de Contactos" icon={<MdContacts />} />,
      component: (
        <UserRelations
          user={{ _id: user._id, userRelations: user.userRelations }}
          isMyProfile={isMyProfile}
        />
      ),
    },
    {
      key: SOLICITUDES_KEY,
      title: <TabTitle title="Administrar Solicitudes" icon={<FaUserPlus />} />,
      component: <UserRelationRequestsGrid items={friendRequests} />,
      requiredProfile: true,
    },
  ].filter((tab) => !tab.requiredProfile || isMyProfile);

  const socialKeys = socialSubTabs.map((tab) => tab.key);
  const isSocialActive = socialKeys.includes(pathname);

  // Solapa activa de "Social" (default: primera sub-solapa).
  const activeSocialKey = isSocialActive ? pathname : REVISTAS_KEY;

  // Solapas de nivel superior: Anuncios / Producciones / Social.
  const topTabs = [
    {
      key: ANUNCIOS_KEY,
      title: <TabTitle title="Anuncios" icon={<IoMdMegaphone />} />,
      component: (
        <>
          {isMyProfile && (
            <div className="mb-2 flex flex-wrap gap-2 md:self-start">
              <PrimaryButton
                startContent={<FaPlus />}
                as={Link}
                href={CREATE}
              >
                Crear Anuncio
              </PrimaryButton>
              <SecondaryButton
                startContent={<FaTable />}
                as={Link}
                href={POST_SEUDOBASE}
              >
                SeudoBase
              </SecondaryButton>
            </div>
          )}
          <UserPosts isMyProfile={isMyProfile} posts={user.posts || []} />
        </>
      ),
    },
    {
      key: PRODUCCIONES_KEY,
      title: <TabTitle title="Producciones" icon={<FaBook />} />,
      component: (
        <ProfileProductionsTab userId={user._id} isMyProfile={isMyProfile} />
      ),
    },
    {
      // "Social" agrupa las sub-solapas. Navega a la sub-solapa activa.
      key: activeSocialKey,
      title: <TabTitle title="Social" icon={<FaUsers />} />,
      component: (
        <div className="w-full flex flex-col gap-4">
          <Tabs
            classNames={{
              panel: "p-0",
              tabList: "max-md:gap-0 p-0",
              tab: "max-md:text-xs",
              tabContent: "max-md:text-xs",
              base: "max-w-full overflow-x-auto",
            }}
            aria-label="Social"
            variant="solid"
            color="secondary"
            selectedKey={activeSocialKey}
          >
            {socialSubTabs.map((tab) => (
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
        </div>
      ),
    },
  ];

  // Clave de la solapa de nivel superior activa.
  const activeTopKey = isSocialActive
    ? activeSocialKey
    : pathname === PRODUCCIONES_KEY
      ? PRODUCCIONES_KEY
      : ANUNCIOS_KEY;

  return (
    <div className="w-full flex flex-col gap-2">
      {isMyProfile && (
        <SecondaryButton
          className="self-end"
          startContent={<FaChartPie />}
          onClick={consumptionModal.onOpen}
        >
          Control de Consumo
        </SecondaryButton>
      )}

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
        selectedKey={activeTopKey}
        id="user-tabs"
      >
        {topTabs.map((tab) => (
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

      {isMyProfile && (
        <ConsumptionControlModal
          isOpen={consumptionModal.isOpen}
          onOpenChange={consumptionModal.onOpenChange}
        />
      )}
    </div>
  );
};

export default UserSolapas;
