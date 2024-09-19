import BoardCard from "@/app/components/Board/Board";
import { Board } from "@/types/board";
import { useUser } from "@clerk/nextjs";
import { Spinner } from "@nextui-org/react";
import { useState, useEffect } from "react";

const BoardGrid = ({ items, isLoading }: { items: Board[]; isLoading: boolean }) => {

  // Create state to hold the columns
  const [columns, setColumns] = useState<Board[][]>([[], [], [], []]);

  // Handle window resizing to dynamically update the columns
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      let columnCount = 1;

      if (screenWidth >= 640 && screenWidth < 1024) {
        columnCount = 2;
      } else if (screenWidth >= 1024 && screenWidth < 1536) {
        columnCount = 3;
      } else if (screenWidth >= 1536) {
        columnCount = 4;
      }

      // Distribute items into columns
      const newColumns: Board[][] = Array(columnCount)
        .fill(null)
        .map(() => []);
      items.forEach((item: Board, index) => {
        newColumns[index % columnCount].push(item);
      });

      setColumns(newColumns);
    };

    // Initialize the columns on mount
    handleResize();

    // Add event listener for window resizing
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, [items]);

  const { user } = useUser();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="grid gap-4">
            {column.map((board: Board, index) => (
              <BoardCard
                bg={board.color || "bg-fondo"}
                isMyBoard={user?.username === board.user.username}
                board={board}
                key={board._id + index}
              />
            ))}
          </div>
        ))}
      </div>
      {!isLoading && items.length === 0 && <p className="max-md:text-sm text-light-text">No se encontraron pizarras para mostrar</p>}
      {isLoading && <Spinner color="warning" />}
    </>
  );
};

export default BoardGrid;
