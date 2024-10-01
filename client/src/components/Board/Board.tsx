import { Board } from "@/types/board";
import { User } from "@/types/userTypes";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Link,
} from "@nextui-org/react";
import React from "react";
import { FaPencil } from "react-icons/fa6";
import UsernameAvatar from "../buttons/UsernameAvatar";
import { PROFILE } from "@/utils/data/urls";

const BoardCard = ({
  isMyBoard,
  board,
  bg,
  isProfile = false,
  name,
}: {
  isMyBoard: boolean;
  board?: Board;
  bg: string;
  isProfile?: boolean;
  name?: string;
}) => {
  const darkColors = ["bg-[#5A0001]/80"];
  const darkColorsBorder = [
    "bg-[#5A0001]/80",
    "bg-[#20A4F3]/30",
    "bg-[#FFB238]/80",
  ];
  const textColor = darkColors.includes(bg) ? "text-white" : "text-text-color";
  const borderColor = darkColorsBorder.includes(bg) ? "border-white" : "";
  if (!board) {
    return (
      <Card
        className={`p-4 flex flex-col gap-2 ${
          isProfile && "min-w-[30%] lg:p-6 md:max-w-[34%] xl:max-w-[50%]"
        }`}
      >
        <CardHeader className="p-0">
          <h6>Pizarra de {name}</h6>
        </CardHeader>
        <CardBody className="p-0">
          <p className="text-xs">El usuario no ha creado su pizarra</p>
        </CardBody>
      </Card>
    );
  } else {
    return (
      <Card
        as={!isProfile ? Link : undefined}
        href={
          !isProfile ? `${PROFILE}/${(board.user as User).username}` : undefined
        }
        className={`p-4 flex flex-col gap-2 ${bg} ${textColor} ${
          isProfile && "min-w-[30%] lg:p-6 md:max-w-[34%] xl:max-w-[50%]"
        }`}
      >
        <CardHeader className="p-0">
          {isProfile ? (
            <h6>Pizarra de {name}</h6>
          ) : (
            <UsernameAvatar
              author={board.user as User}
              showAvatar
              textColor={textColor}
            />
          )}
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
          {isMyBoard && (
            <Button isIconOnly variant="flat" color="primary" radius="full">
              <FaPencil className="size-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
};

export default BoardCard;