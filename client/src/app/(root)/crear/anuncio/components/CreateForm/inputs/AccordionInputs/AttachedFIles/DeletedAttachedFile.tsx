import FileChip from "@/components/chips/FileChip";
import { PostAttachedFile } from "@/types/postTypes";
import { Button, Card, CardBody, Chip, Tooltip } from "@nextui-org/react";
import { FaPlus } from "react-icons/fa6";

const DeletedAttachedFile = ({
  attachedFile,
  addBackDeletedAttachedFile,
}: {
  attachedFile: PostAttachedFile;
  addBackDeletedAttachedFile: (_id: string) => void;
}) => {
  return (
    <Card className="w-full border border-danger">
      <CardBody className="flex flex-col gap-2">
        <div className="flex justify-between items-start w-full gap-4">
          <div className="flex gap-4 flex-col flex-1">
            <span className="text-sm lg:text-base">{attachedFile.label}</span>
            <FileChip>{attachedFile.url}</FileChip>
            <p className="text-xs lg:text-sm italic text-danger">
              Archivo que será eliminado
            </p>
          </div>
          <div className="flex gap-2 mt-6">
            <Tooltip placement="bottom-end" content="Restaurar archivo">
              <Button
                isIconOnly
                aria-label="Restaurar archivo"
                variant="flat"
                radius="full"
                color="secondary"
                className="mb-2"
                onPress={() => addBackDeletedAttachedFile(attachedFile._id)}
              >
                <FaPlus />
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default DeletedAttachedFile;
