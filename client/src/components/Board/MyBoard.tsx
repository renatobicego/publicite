"use client";
import { Board } from "@/types/board";
import { Button, Card, CardFooter, CardHeader } from "@nextui-org/react";
import React, { useState } from "react";
import Annotations from "./sections/Annotations";
import Keywords from "./sections/Keywords";
import { FaPencil } from "react-icons/fa6";
import CreateBoard from "./CreateBoard/CreateBoard";
import { handleBoardColor } from "@/utils/functions/utils";

const MyBoard = ({
  board,
  name,
  widthFull,
  user,
}: {
  board: Board;
  name?: string;
  widthFull?: boolean;
  user?: {
    fullName: string;
    username: string;
    _id: string;
  };
  }) => {
  const [showEditBoard, setShowEditBoard] = useState(false);
  const [localBoardData, setLocalBoardData] = useState(board);
  const bg = localBoardData?.color || "bg-fondo";
  // Change style of board based in color of the board
  const { textColor, borderColor } = handleBoardColor(bg);
  // if the board is being edited, return the create board component
  if (showEditBoard) {
    return (
      <CreateBoard
        prevBoard={localBoardData}
        setShowEditBoard={setShowEditBoard}
        setLocalBoardData={setLocalBoardData}
        user={
          {
            name: user?.fullName as string,
            username: user?.username as string,
            _id: localBoardData.user as any,
          } as any
        }
      />
    );
  }
  // if the board is not being edited, return the board component
  return (
    <Card
      className={`p-4 flex flex-col gap-2 ${localBoardData.color} ${textColor} ${
        !widthFull &&
        "min-w-full md:min-w-[30%] lg:p-6 md:max-w-[34%] xl:max-w-[50%]"
      }`}
    >
      <CardHeader className="p-0">
        <h6>Pizarra de {name}</h6>
      </CardHeader>
      <Annotations annotations={localBoardData.annotations} />
      <CardFooter className="flex w-full items-center justify-between p-0 pt-2">
        <Keywords
          keywords={localBoardData.keywords}
          textColor={textColor}
          borderColor={borderColor}
        />
        <Button
          onPress={() => setShowEditBoard(true)}
          isIconOnly
          aria-label="Editar pizarra"
          variant="flat"
          color="primary"
          radius="full"
        >
          <FaPencil className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MyBoard;
