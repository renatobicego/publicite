import { UserRelationNotification } from "@/types/userTypes";
import UserRelationCard from "./UserRelationCard";

const UserRelationRequestsGrid = ({
  items,
}: {
  items: UserRelationNotification[];
}) => {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4">
        {items &&
          items.map((userRelation, index) => (
            <UserRelationCard
              userRelation={userRelation}
              key={userRelation._id}
            />
          ))}
      </div>
      {(!items || items.length === 0) && (
        <p className="max-md:text-sm text-light-text">
          No se encontraron solicitudes para mostrar
        </p>
      )}
    </>
  );
};

export default UserRelationRequestsGrid;
