"use client";
import { CardHeader, CardFooter, Card, Link } from "@nextui-org/react";
import UsernameAvatar from "../buttons/UsernameAvatar";
import { Board } from "@/types/board";
import Annotations from "./sections/Annotations";
import Keywords from "./sections/Keywords";
import { PROFILE } from "@/utils/data/urls";
import { User } from "@/types/userTypes";
import { handleBoardColor } from "@/utils/functions/utils";

const BoardContent = ({
  board,
  isProfile,
  name,
  widthFull = false,
}: {
  board: Board;
  name?: string;
  isProfile: boolean;
  widthFull?: boolean;
}) => {
  const bg = board?.color || "bg-fondo";
  // Change style of board based in color of the board
  const { textColor, borderColor } = handleBoardColor(bg);
  return (
    <Card
      // if is a board shown in baord grid (explorar), it should be a link
      as={!isProfile ? Link : undefined}
      href={!isProfile ? `${PROFILE}/${(board.user as User)._id}` : undefined}
      className={`p-4 flex flex-col gap-2 ${board.color} ${textColor} ${
        isProfile &&
        !widthFull &&
        "min-w-full md:min-w-[30%] lg:p-6 md:max-w-[34%] xl:max-w-[50%]"
      }`}
      id="board"
    >
      <CardHeader className="p-0">
        {isProfile ? (
          <h6>Pizarra de {name}</h6>
        ) : (
          <UsernameAvatar
            author={board.user}
            showAvatar
            textColor={textColor}
            withoutLink
          />
        )}
      </CardHeader>
      <Annotations annotations={board.annotations} />
      <CardFooter className="flex w-full items-center justify-between p-0 pt-2">
        <Keywords
          keywords={board.keywords}
          textColor={textColor}
          borderColor={borderColor}
        />
      </CardFooter>
    </Card>
  );
};

export default BoardContent;
