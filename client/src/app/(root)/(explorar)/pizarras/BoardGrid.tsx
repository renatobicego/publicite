import BoardCard from "@/components/Board/Board";
import useMasonryGrid from "@/utils/hooks/useMasonryGrid";
import { Board } from "@/types/board";
import { Spinner } from "@nextui-org/react";
import { User } from "@/types/userTypes";
import { useUserData } from "../../providers/userDataProvider";

const BoardGrid = ({
  items,
  isLoading,
}: {
  items: Board[];
  isLoading: boolean;
}) => {
  const { columns } = useMasonryGrid(items);
  const { usernameLogged } = useUserData();
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="grid gap-4 items-start">
            {column.map((board: Board, index) => (
              <BoardCard
                isMyBoard={
                  usernameLogged
                    ? usernameLogged === (board.user as User).username
                    : false
                }
                board={board}
                key={board._id + index}
              />
            ))}
          </div>
        ))}
      </div>
      {!isLoading && items.length === 0 && (
        <p className="max-md:text-sm text-light-text">
          No se encontraron pizarras para mostrar
        </p>
      )}
      {isLoading && <Spinner color="warning" />}
    </>
  );
};

export default BoardGrid;
