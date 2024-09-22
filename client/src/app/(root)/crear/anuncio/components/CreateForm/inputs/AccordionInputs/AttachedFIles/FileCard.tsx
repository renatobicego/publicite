import { AttachedFileValues, PostAttachedFile } from "@/types/postTypes";
import { Button, Card, CardBody, Chip, Tooltip } from "@nextui-org/react";
import { FaFile, FaX } from "react-icons/fa6";
import FileUploadButton from "./FileUploadButton";
import { CustomInputWithoutFormik } from "@/app/components/inputs/CustomInputs";
import { FormikErrors } from "formik";

const FileCard = ({
  attachedFile,
  onFileChange,
  onLabelChange,
  onRemove,
  error,
}: {
  attachedFile: AttachedFileValues;
  onFileChange: (file: File | null, _id: string) => void;
  onLabelChange: (label: string, _id: string) => void;
  onRemove: (_id: string) => void;
  error: FormikErrors<PostAttachedFile> | null;
}) => {
  return (
    <Card className="w-full">
      <CardBody className="flex flex-col gap-2">
        {!attachedFile.file ? (
          <>
            <div className="flex justify-between items-center lg:gap-2 max-lg:flex-col max-lg:items-end">
              <CustomInputWithoutFormik
                type="text"
                placeholder="Agregue una etiqueta descriptiva"
                description="Por ejemplo: manual de instrucciones"
                label="Etiqueta"
                value={attachedFile.label}
                onChange={(e) =>
                  onLabelChange(e.target.value, attachedFile._id)
                }
              />
              <div className="flex gap-2">
                <FileUploadButton
                  label={attachedFile.label}
                  onFileChange={(e) =>
                    onFileChange(e.target.files?.[0] ?? null, attachedFile._id)
                  }
                />
                <Button
                  isIconOnly
                  variant="flat"
                  radius="full"
                  color="danger"
                  className="mb-1"
                  onClick={() => onRemove(attachedFile._id)}
                >
                  <FaX />
                </Button>
              </div>
            </div>
            {!attachedFile.label && (
              <p className="text-danger max-md:text-xs md:text-sm xl:hidden">
                Agregar primero una etiqueta para subir archivo
              </p>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div className="flex gap-4 flex-col">
                <span className="text-sm lg:text-base">
                  {attachedFile.label}
                </span>
                <Chip
                  color="secondary"
                  variant="flat"
                  startContent={<FaFile />}
                  classNames={{content: "whitespace-normal", base: "min-h-7 h-auto"}}
                >
                  {attachedFile.file.name}
                </Chip>
              </div>
              <Button
                isIconOnly
                variant="flat"
                radius="full"
                color="danger"
                className="mb-2"
                onClick={() => onRemove(attachedFile._id)}
              >
                <FaX />
              </Button>
            </div>
            {error?.url && <p className="text-red-500 text-sm">{error.url}</p>}
            {error?.label && (
              <p className="text-red-500 text-sm">{error.label}</p>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default FileCard;
