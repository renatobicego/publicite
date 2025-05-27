import GroupCard from "@/components/cards/GroupCard";
import { GetGroups, Group } from "@/types/groupTypes";
import { Spinner } from "@nextui-org/react";

const GroupsGrid = ({
  items,
  isLoading = false,
  isUserProfile = false,
}: {
  items: GetGroups[];
  isLoading?: boolean;
  isUserProfile?: boolean;
}) => {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4">
        {items &&
          items.map((group: GetGroups, index) => (
            <GroupCard
              group={group}
              key={group.group._id}
              isUserProfile={isUserProfile}
            />
          ))}
      </div>
      {!isLoading && items.length === 0 && (
        <p className="max-md:text-sm text-light-text">
          No se encontraron grupos para mostrar
        </p>
      )}
      {isLoading && <Spinner color="warning" />}
    </>
  );
};

export default GroupsGrid;
