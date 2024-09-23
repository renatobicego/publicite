import { PostAttachedFile } from "@/types/postTypes";
import { Chip, Link } from "@nextui-org/react";
import { FaFile } from "react-icons/fa6";

const AttachedFiles = ({
  attachedFiles,
}: {
  attachedFiles: PostAttachedFile[];
}) => {
  return (
    <div className="flex gap-2 w-full flex-wrap">
      {attachedFiles.map((file) => (
        <Chip
          key={file._id}
          color="secondary"
          variant="bordered"
          className="px-2"
          as={Link}
          target={"_blank"}
          startContent={<FaFile />}
          href={file.url}
        >
          {file.label}
        </Chip>
      ))}
    </div>
  );
};

export default AttachedFiles;
