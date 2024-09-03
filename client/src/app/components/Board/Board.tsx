import { BoardType, User } from "@/types/userTypes";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
} from "@nextui-org/react";
import React from "react";
import { FaPencil } from "react-icons/fa6";

const Board = ({
  isMyBoard,
  board,
  bg,
}: {
  isMyBoard: boolean;
  board: BoardType;
  bg: string;
}) => {
  const darkColors = ["bg-[#5A0001]/80"];
  const darkColorsBorder = [
    "bg-[#5A0001]/80",
    "bg-[#20A4F3]/30",
    "bg-[#FFB238]/80",
  ];
  const textColor = darkColors.includes(bg) ? "text-white" : "text-text-color";
  const borderColor = darkColorsBorder.includes(bg) ? "border-white" : "";
  return (
    <Card className={`p-4 flex flex-col gap-2 ${bg} ${textColor}`}>
      <CardHeader className="p-0">
        <h6>Pizarra de {(board.user as User).name}</h6>
      </CardHeader>
      <CardBody className="p-0">
        <ul className="list-inside list-disc text-sm">
          {board.annotations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardBody>
      <CardFooter className="flex w-full items-center justify-between p-0 pt-2">
        <div className="flex gap-1">
          {board.keywords.map((item) => (
            <Chip
              size="sm"
              key={item}
              color="default"
              variant="bordered"
              className={`${textColor} ${borderColor}`}
            >
              {item}
            </Chip>
          ))}
        </div>
        <Button isIconOnly variant="flat" color="primary" radius="full">
          <FaPencil className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Board;
