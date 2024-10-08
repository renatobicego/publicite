"use client";
import { Board } from "@/types/board";
import { Button, Card, CardFooter, CardHeader } from "@nextui-org/react";
import React, { useState } from "react";
import Annotations from "./sections/Annotations";
import Keywords from "./sections/Keywords";
import { FaPencil } from "react-icons/fa6";
import CreateBoard from "./CreateBoard/CreateBoard";
import { useUser } from "@clerk/nextjs";

const MyBoard = ({
  board,
  textColor,
  borderColor,
  name,
  widthFull,
}: {
  board: Board;
  textColor: string;
  borderColor: string;
  name?: string;
  widthFull?: boolean;
}) => {
  const [showEditBoard, setShowEditBoard] = useState(false);
  const { user } = useUser();
  // if the board is being edited, return the create board component
  if (showEditBoard) {
    return (
      <CreateBoard
        prevBoard={board}
        setShowEditBoard={setShowEditBoard}
        user={
          {
            username: user?.username as string,
            _id: board.user as any,
          } as any
        }
      />
    );
  }
  // if the board is not being edited, return the board component
  return (
    <Card
      className={`p-4 flex flex-col gap-2 ${board.color} ${textColor} ${
        !widthFull &&
        "min-w-full md:min-w-[30%] lg:p-6 md:max-w-[34%] xl:max-w-[50%]"
      }`}
    >
      <CardHeader className="p-0">
        <h6>Pizarra de {name}</h6>
      </CardHeader>
      <Annotations annotations={board.annotations} />
      <CardFooter className="flex w-full items-center justify-between p-0 pt-2">
        <Keywords
          keywords={board.keywords}
          textColor={textColor}
          borderColor={borderColor}
        />
        <Button
          onPress={() => setShowEditBoard(true)}
          isIconOnly
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
