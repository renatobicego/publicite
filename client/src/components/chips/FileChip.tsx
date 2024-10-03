import { Chip } from "@nextui-org/react";
import { FaFile } from "react-icons/fa6";

const FileChip = ({ children }: { children: React.ReactNode }) => {
  return (
    <Chip
      color="secondary"
      className="px-2"
      variant="flat"
      startContent={<FaFile />}
      classNames={{
        content: "whitespace-normal",
        base: "min-h-7 h-auto",
      }}
    >
      {children}
    </Chip>
  );
};

export default FileChip;
