import { Good, Petition, Service } from "@/types/postTypes";
import { Button, Tooltip } from "@nextui-org/react";
import { FaShareAlt } from "react-icons/fa";

const ShareButton = ({ post }: { post: Good | Service | Petition }) => {
  return (
    <Tooltip placement="bottom" content="Compartir">
      <Button
        isIconOnly
        variant="flat"
        color="secondary"
        radius="full"
        className="p-1"
      >
        <FaShareAlt />
      </Button>
    </Tooltip>
  );
};

export default ShareButton;
