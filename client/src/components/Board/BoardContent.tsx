"use client"
import { CardHeader, CardFooter, Card, Link } from "@nextui-org/react";
import UsernameAvatar from "../buttons/UsernameAvatar";
import { Board } from "@/types/board";
import Annotations from "./sections/Annotations";
import Keywords from "./sections/Keywords";
import { PROFILE } from "@/utils/data/urls";
import { User } from "@/types/userTypes";

const BoardContent = ({
  board,
  textColor,
  borderColor,
  isProfile,
  name,
  widthFull = false,
}: {
  board: Board;
  textColor: string;
  borderColor: string;
  name?: string;
  isProfile: boolean;
  widthFull?: boolean;
  }) => {
  
  return (
    <Card
      // if is a board shown in baord grid (explorar), it should be a link
      as={!isProfile ? Link : undefined}
      href={
        !isProfile ? `${PROFILE}/${(board.user as User).username}` : undefined
      }
      className={`p-4 flex flex-col gap-2 ${board.color} ${textColor} ${
        isProfile &&
        !widthFull &&
        "min-w-full md:min-w-[30%] lg:p-6 md:max-w-[34%] xl:max-w-[50%]"
      }`}
    >
      <CardHeader className="p-0">
        {isProfile ? (
          <h6>Pizarra de {name}</h6>
        ) : (
          <UsernameAvatar
            author={board.user}
            showAvatar
            textColor={textColor}
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
