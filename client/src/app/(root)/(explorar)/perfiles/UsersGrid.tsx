import ProfileCard from "@/components/cards/ProfileCard";
import { User } from "@/types/userTypes";
import { Spinner } from "@nextui-org/react";

const UsersGrid = ({
  items,
  isLoading = false,
  groupGrid = false,
}: {
  items: User[];
  isLoading?: boolean;
  groupGrid?: boolean;
}) => {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4">
        {items.map((user: User, index) => (
          <ProfileCard user={user} key={user._id + index} groupGrid={groupGrid} />
        ))}
      </div>
      {!isLoading && items.length === 0 && (
        <p className="max-md:text-sm text-light-text">
          No se encontraron perfiles para mostrar
        </p>
      )}
      {isLoading && <Spinner color="warning" />}
    </>
  );
};

export default UsersGrid;
