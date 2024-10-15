import GroupCard from "@/components/cards/GroupCard";
import ProfileCard from "@/components/cards/ProfileCard";
import { Group, User } from "@/types/userTypes";
import { Spinner } from "@nextui-org/react";

const GroupsGrid = ({
  items,
  isLoading = false,
}: {
  items: Group[];
  isLoading?: boolean;
}) => {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4">
        {items && items.map((group: Group, index) => (
          <GroupCard group={group} key={group._id + index} />
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
