import ProfileCard from "@/components/cards/ProfileCard";
import { User } from "@/types/userTypes";
import { Group } from "@/types/groupTypes";
import { Spinner } from "@nextui-org/react";
import MemberCard from "@/components/cards/MemberCard";

const UsersGrid = ({
  items,
  isLoading = false,
  groupGrid = false,
  group,
  userLogged,
}: {
  items: User[];
  isLoading?: boolean;
  groupGrid?: boolean;
  group?: Group;
  userLogged: { username: string; _id: string };
}) => {
  const isAdmin = (user: User) =>
    group?.admins.some((admin) => (admin as User)._id === user._id);
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4">
        {items &&
          items.map((user: User, index) =>
            groupGrid && group ? (
              <MemberCard
                user={user}
                group={group}
                key={user._id}
                isAdmin={isAdmin(user)}
                userLogged={userLogged}
              />
            ) : (
              <ProfileCard user={user} key={user._id} />
            )
          )}
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
