import PrimaryButton from "@/components/buttons/PrimaryButton";
import UserRelationsGrid from "@/components/grids/UserRelationsGrid";
import ManageActiveUserRelationsModal from "@/components/modals/ManageActiveUserRelations/ManageActiveUserRelationsModal";
import { User } from "@/types/userTypes";
import { PROFILE } from "@/utils/data/urls";
import { Link, Tab, Tabs, user } from "@nextui-org/react";
import { useMemo, useState } from "react";
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

  const filteredRelations = useMemo(() => {
    const items = [...user.userRelations];
    switch (solapaSelected) {
      case "all":
        return items;
      case "active":
        // TODO: implementar
        return items;
      case "contacts":
        return items.filter((item) => item.typeRelationA === "contacts");
      case "friends":
        return items.filter((item) => item.typeRelationA === "friends");
      case "topfriends":
        return items.filter((item) => item.typeRelationA === "topfriends");
      default:
        return items;
    }
  }, [solapaSelected, user.userRelations]);
  return (
    <>
      {isMyProfile && (
        <PrimaryButton
          className="mb-2 md:self-start"
          startContent={<FaPlus />}
          as={Link}
          href={PROFILE}
        >
          Agregar Contactos
        </PrimaryButton>
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
      {isMyProfile && solapaSelected === "active" && (
        <ManageActiveUserRelationsModal
          relations={user.userRelations}
          activeRelationsIds={filteredRelations.map((relation) => relation._id)}
          userId={user._id}
        />
      )}
      <UserRelationsGrid userId={user._id} items={filteredRelations} />
    </>
  );
};

export default UserRelations;
