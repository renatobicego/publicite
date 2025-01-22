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
import { emitPostActivityNotification } from "../../notifications/postsActivity/emitNotifications";
import { useSocket } from "@/app/socketProvider";
import { Good, Post } from "@/types/postTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { removePostReaction } from "@/app/server/postActions";
import { getEmojiName } from "@/utils/functions/utils";

const ReactToPost = ({ post, emojis }: { post: Post; emojis: string[] }) => {
  // handle open state of popov er
  const [isOpen, setIsOpen] = useState(false);

  // is loading the petititon
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();
  // reactions of the post, stored in the state to not make a request every time
  const [reactions, setReactions] = useState(post.reactions);
  const { userIdLogged } = useUserData();

  // get the reaction of the user logged if exists
  const userReaction = useMemo(() => {
    if (!reactions) return null;
    return reactions.find((reaction) => reaction.user === userIdLogged);
  }, [reactions, userIdLogged]);

  const handleReaction = async (emoji: string) => {
    setIsLoading(true);
    // if user already reacted with the same emoji, remove the reaction
    if (userReaction) {
      // Remove reaction
      const res = await removePostReaction(userReaction._id);
      if ("error" in res) {
        toastifyError(
          "No se pudo remover la reacción. Por favor, intenta de nuevo."
        );
        setIsLoading(false);
        return;
      }
      setReactions((prev) =>
        prev.filter((reaction) => reaction._id !== userReaction._id)
      );

      // if user removed the reaction that he had before
      if (emoji === userReaction?.reaction) {
        toastifySuccess(`Reacción removida`);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }
    }

    // Add reaction
    emitPostActivityNotification<string>(
      socket,
      post.author._id,
      {
        _id: post._id,
        title: post.title,
        imageUrl: "imagesUrls" in post ? (post as Good).imagesUrls[0] : "",
        postType: post.postType,
      },
      null,
      {
        payload: { emoji },
        event: "notification_post_new_reaction",
      }
    )
      .then((res) => {
        toastifySuccess(`Reaccionaste con ${getEmojiName(emoji)}`);
        setReactions((prev) => [
          ...prev,
          { reaction: emoji, user: userIdLogged as string, _id: res.body },
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
  );
};

export default ReactToPost;
