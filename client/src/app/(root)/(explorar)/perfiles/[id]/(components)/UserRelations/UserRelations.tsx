import { useConfigData } from "@/app/(root)/providers/userDataProvider";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import UserRelationsGrid from "@/components/grids/UserRelationsGrid";
import ManageActiveUserRelationsModal from "@/components/modals/ManageActiveUserRelations/ManageActiveUserRelationsModal";
import type { User, UserRelations } from "@/types/userTypes";
import { PROFILE } from "@/utils/data/urls";
import { Link, Tab, Tabs, user } from "@nextui-org/react";
import { useCallback, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";

type UserRelationsType = "all" | "active" | UserRelation;

const UserRelations = ({
  user,
  isMyProfile,
}: {
  user: Pick<User, "_id" | "userRelations">;
  isMyProfile: boolean;
}) => {
  const [solapaSelected, setSolapaSelected] =
    useState<UserRelationsType>("all");
  const { configData } = useConfigData();

  const tabs: { key: UserRelationsType; label: string }[] = [
    {
      key: "all",
      label: "Todos",
    },
    {
      key: "active",
      label: "Activos",
    },
    {
      key: "contacts",
      label: "Contactos",
    },
    {
      key: "friends",
      label: "Amigos",
    },
    {
      key: "topfriends",
      label: "Top Amigos",
    },
  ];

  const getActiveRelations = useCallback(
    (items: UserRelations[]) => {
      const activeRelations = configData?.activeRelations ?? [];
      // Create a Set of active relation IDs for faster lookups
      const activeRelationIds = new Set(
        activeRelations.map((relation) => relation._id)
      );

      // Filter items by checking if their IDs exist in the Set
      return items.filter((relation) => activeRelationIds.has(relation._id));
    },
    [configData?.activeRelations]
  );
  const filteredRelations = useMemo(() => {
    const items = [...user.userRelations];
    switch (solapaSelected) {
      case "all":
        return items;
      case "active":
        return getActiveRelations(items);
      case "contacts":
        return items.filter((item) => item.typeRelationA === "contacts");
      case "friends":
        return items.filter((item) => item.typeRelationA === "friends");
      case "topfriends":
        return items.filter((item) => item.typeRelationA === "topfriends");
      default:
        return items;
    }
  }, [getActiveRelations, solapaSelected, user.userRelations]);

  return (
    <>
      {isMyProfile && (
        <menu className="gap-2 flex items-center">
          <PrimaryButton
            className="mb-2 md:self-start"
            startContent={<FaPlus />}
            as={Link}
            href={PROFILE}
          >
            Agregar Contactos
          </PrimaryButton>
          <ManageActiveUserRelationsModal
            relations={user.userRelations}
            activeRelationsIds={getActiveRelations(user.userRelations).map(
              (relation) => relation._id
            )}
            userId={user._id}
          />
        </menu>
      )}
      <Tabs
        selectedKey={solapaSelected}
        onSelectionChange={(key) => {
          const keyParsed = key as UserRelationsType;
          setSolapaSelected(keyParsed);
        }}
        aria-label="solapas de tipos de relaciones de usuario"
        variant={"underlined"}
      >
        {tabs.map((tab) => (
          <Tab key={tab.key} title={tab.label} />
        ))}
      </Tabs>
      <UserRelationsGrid userId={user._id} items={filteredRelations} />
    </>
  );
};

export default UserRelations;
