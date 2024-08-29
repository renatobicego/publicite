"use client"
import { Button, ButtonProps } from "@nextui-org/react";
import React from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";

interface SaveButtonProps extends ButtonProps {
  saved: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ saved, ...props }) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
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
  );
};

export default SaveButton;
