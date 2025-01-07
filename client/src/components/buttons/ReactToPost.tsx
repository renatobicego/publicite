"use client";
import {
  Badge,
  Button,
  Chip,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import React, { useMemo, useState } from "react";
import { MdOutlineAddReaction } from "react-icons/md";
import { emitPostActivityNotification } from "../notifications/postsActivity/emitNotifications";
import { useSocket } from "@/app/socketProvider";
import { Good, Post } from "@/types/postTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { removePostReaction } from "@/app/server/postActions";

const ReactToPost = ({ post }: { post: Post }) => {
  const [isOpen, setIsOpen] = useState(false);
  const emojis = ["👍", "😊", "❤️", "😂", "😲"];
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();
  const [reactions, setReactions] = useState(post.reactions);
  const { userIdLogged } = useUserData();

  const userReaction = useMemo(() => {
    return reactions.find((reaction) => reaction.user === userIdLogged);
  }, [reactions, userIdLogged]);

  const getEmojiName = (emoji: string) => {
    switch (emoji) {
      case "👍":
        return "Me Gusta";
      case "❤️":
        return "Me Encanta";
      case "😊":
        return "Me Alegra";
      case "😂":
        return "Me Divierte";
      case "😲":
        return "Me Sorprende";
    }
  };

  const handleReaction = async (emoji: string) => {
    setIsLoading(true);
    if (userReaction) {
      // Remove reaction
      const res = await removePostReaction(userReaction._id);
      if ("error" in res) {
        toastifyError("No se pudo reaccionar. Por favor, intenta de nuevo.");
        setIsLoading(false);
        return;
      }

      // if user removed the reaction that he had before
      if (emoji === userReaction?.reaction) {
        toastifySuccess(`Reacción removida`);
        setReactions((prev) =>
          prev.filter((reaction) => reaction._id !== userReaction._id)
        );
        setIsOpen(false);
        setIsLoading(false);
        return;
      }
    }

    // Add reaction
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
      .then(() => {
        toastifySuccess(`Reaccionaste con ${getEmojiName(emoji)}`);
        setReactions((prev) => [
          ...prev,
          { reaction: emoji, user: "", _id: "" },
        ]);
      })
      .catch(() =>
        toastifyError("No se pudo reaccionar. Por favor, intenta de nuevo.")
      )
      .finally(() => {
        setIsOpen(false);
        setIsLoading(false);
      });
  };

  const groupedReactions = useMemo(() => {
    if (!reactions || reactions.length === 0) return {};
    return reactions.reduce<Record<string, number>>((acc, reaction) => {
      const emoji = reaction.reaction;
      if (emoji) {
        acc[emoji] = (acc[emoji] || 0) + 1;
      }
      return acc;
    }, {});
  }, [reactions]);

  return (
    <menu className="relative">
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
            aria-label={
              userReaction
                ? `Tu reacción: ${getEmojiName(userReaction.reaction)}`
                : "Abrir menú de reacciones"
            }
          >
            {userReaction ? (
              userReaction.reaction
            ) : (
              <MdOutlineAddReaction className="size-4" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <menu className="flex gap-2">
            {emojis.map((emoji, index) => (
              <Button
                size="lg"
                key={index}
                variant={
                  userReaction && userReaction.reaction === emoji
                    ? "flat"
                    : "light"
                }
                onPress={() => handleReaction(emoji)}
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
      <aside className="flex gap-2 absolute -bottom-8 right-0">
        {emojis.map((emoji) => {
          const count = groupedReactions[emoji] || 0;
          if (count > 0) {
            return (
              <Chip
                key={emoji}
                variant="bordered"
                radius="full"
                className="text-xs"
                size="sm"
                aria-label={`${count} ${getEmojiName(emoji)} ${
                  count === 1 ? "reacción" : "reacciones"
                }`}
              >
                {emoji} {count}
              </Chip>
            );
          }
          return null;
        })}
      </aside>
    </menu>
  );
};

export default ReactToPost;
