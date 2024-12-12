import React from "react";
import ProfileCard from "../cards/ProfileCard";
import { UserRelations } from "@/types/userTypes";

const UserRelationsGrid = ({
  items,
  userId,
}: {
  items: UserRelations[];
  userId: string;
}) => {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4">
        {items &&
          items.map((relation, index) => (
            <ProfileCard
              user={
                relation.userA._id === userId
                  ? relation.userB
                  : relation.userA
              }
              key={relation._id}
            />
          ))}
      </div>
      {(!items || items.length === 0) && (
        <p className="max-md:text-sm text-light-text">
          No se encontraron perfiles para mostrar
        </p>
      )}
    </>
  );
};

export default UserRelationsGrid;
