"use client";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import React, { useState } from "react";
import { MdOutlineAddReaction } from "react-icons/md";
import { emitPostActivityNotification } from "../notifications/postsActivity/emitNotifications";
import { useSocket } from "@/app/socketProvider";
import { Good, Post } from "@/types/postTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";

const ReactToPost = ({ post }: { post: Post }) => {
  const [isOpen, setIsOpen] = useState(false);
  const emojis = ["👍", "😊", "❤️", "😂", "😲"];
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();

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

  const handleSubmit = (emoji: string) => {
    setIsLoading(true);
    emitPostActivityNotification(
      socket,
      "notification_post_new_reaction",
      post.author._id,
      {
        _id: post._id,
        title: post.title,
        imageUrl: "imagesUrls" in post ? (post as Good).imagesUrls[0] : "",
        postType: post.postType,
      },
      null,
      {
        emoji,
      }
    )
      .then(() => toastifySuccess(`Reaccionaste con ${getEmojiName(emoji)}`))
      .catch(() =>
        toastifyError("No se pudo reaccionar. Por favor, intenta de nuevo.")
      )
      .finally(() => {
        setIsOpen(false);
        setIsLoading(false);
      });
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      showArrow
      placement="bottom"
    >
      <PopoverTrigger>
        <Button
          radius="full"
          variant="flat"
          isIconOnly
          isLoading={isLoading}
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
              onPress={() => handleSubmit(emoji)}
              isDisabled={isLoading}
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
