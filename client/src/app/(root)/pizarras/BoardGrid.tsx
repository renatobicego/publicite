import BoardCard from "@/app/components/Board/Board";
import useMasonryGrid from "@/app/utils/hooks/useMasonryGrid";
import { Board } from "@/types/board";
import { useUser } from "@clerk/nextjs";
import { Spinner } from "@nextui-org/react";
import { useState, useEffect } from "react";

const BoardGrid = ({ items, isLoading }: { items: Board[]; isLoading: boolean }) => {
  const {columns} = useMasonryGrid(items);
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
