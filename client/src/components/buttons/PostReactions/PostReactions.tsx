import { PostReaction } from "@/types/postTypes";
import { getEmojiName } from "@/utils/functions/utils";
import { Chip } from "@nextui-org/react";
import { useMemo } from "react";

const PostReactions = ({
  emojis,
  reactions,
}: {
  emojis: string[];
  reactions: PostReaction[];
}) => {
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
  );
};

export default PostReactions;
