"use client";
import { Good, Petition, Service } from "@/types/postTypes";
import { Button, ButtonProps, Tooltip } from "@nextui-org/react";
import React from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";

interface SaveButtonProps extends ButtonProps {
  saved: boolean;
  post: Good | Service | Petition;
}

const SaveButton: React.FC<SaveButtonProps> = ({ saved, post, ...props }) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <Tooltip placement="bottom" content={saved ? "Guardado" : "Guardar en Revista"}>
      <Button
        isIconOnly
        color="primary"
        radius="full"
        {...props}
        onClick={handleClick}
        className={`opacity-75 data-[hover=true]:opacity-100 ${props.className}`}
      >
        {saved ? <FaBookmark /> : <FaRegBookmark />}
      </Button>
    </Tooltip>
  );
};

export default SaveButton;
