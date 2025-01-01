"use client";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from "@nextui-org/react";
import React from "react";
import { MdOutlineAddReaction } from "react-icons/md";

const ReactToPost = () => {
  const emojis = ["👍", "😊", "❤️", "😂", "😲"];

  const getEmojiName = (emoji: string) => {
    switch (emoji) {
      case "👍":
        return "me gusta";
      case "❤️":
        return "me encanta";
      case "😊":
        return "me alegra";
      case "😂":
        return "me divierte";
      case "😲":
        return "me sorprende";
    }
  };

  return (
    <Popover showArrow placement="bottom">
      <PopoverTrigger>
        <Button
          radius="full"
          variant="flat"
          isIconOnly
          aria-label="Abrir menú de reacciones"
        >
          <MdOutlineAddReaction className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <menu className="flex gap-2">
          {emojis.map((emoji, index) => (
            <Button
              size="lg"
              key={index}
              variant="light"
              radius="full"
              className="p-0.5 w-12 h-12 min-w-12 text-xl lg:text-2xl"
              aria-label={`Reaccionar con ${getEmojiName(emoji)}`}
            >
              {emoji}
            </Button>
          ))}
        </menu>
      </PopoverContent>
    </Popover>
  );
};

export default ReactToPost;
