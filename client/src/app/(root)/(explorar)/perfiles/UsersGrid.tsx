import ProfileCard from "@/components/cards/ProfileCard";
import { User } from "@/types/userTypes";
import { Group } from "@/types/groupTypes";
import { Spinner, user } from "@nextui-org/react";
import { addAdmin, removeMember } from "@/app/server/groupActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next-nprogress-bar";

const UsersGrid = ({
  items,
  isLoading = false,
  groupGrid = false,
  group,
}: {
  items: User[];
  isLoading?: boolean;
  groupGrid?: boolean;
  group?: Group;
  }) => {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4">
        {items &&
          items.map((user: User, index) => (
            <ProfileCard
              user={user}
              key={user._id + index}
              groupGrid={groupGrid}
              group={group}
              isAdmin={group?.admins.some(
                (admin) => (admin as User)._id === user._id
              )}
            />
          ))}
      </div>
      {!isLoading && (!items || items.length === 0) && (
        <p className="max-md:text-sm text-light-text">
          No se encontraron perfiles para mostrar
        </p>
      )}
      {isLoading && <Spinner color="warning" />}
    </>
  );
};

export default UsersGrid;
