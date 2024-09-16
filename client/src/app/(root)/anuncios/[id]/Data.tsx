import { getTimeBetweenToday } from "@/app/utils/dates";
import { conditionItems } from "@/app/utils/selectData";
import { Good, Service } from "@/types/postTypes";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";

const Data = ({ post }: { post: Good | Service }) => {
  const good = post as Good;
  const service = post as Service;

  const datePublished = getTimeBetweenToday(
    parseDate(good.createdAt)
  );
  return (
    <div className="flex-1 flex flex-col gap-2">
      <p className="text-sm text-light-text">
        {post.postType === "Good"
          ? conditionItems.find((item) => item.value === good.condition)?.label
          : ""}{" "}
        | Publicado {datePublished}
      </p>
    </div>
  );
};

export default Data;
