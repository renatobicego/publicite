import { PostAttachedFile } from "@/types/postTypes";
import { Button, Card, CardBody, Chip } from "@nextui-org/react";
import { FaFile, FaPencil, FaCheck, FaX } from "react-icons/fa6";
import { CustomInputWithoutFormik } from "@/components/inputs/CustomInputs";
import { FormikErrors } from "formik";
import { useState } from "react";

const PrevAttachedFile = ({
  attachedFile,
  onLabelChange,
  onRemove,
  error,
}: {
  attachedFile: PostAttachedFile;
  onLabelChange: (label: string, _id: string, isPrev?: boolean) => void;
  onRemove: (_id: string, isPrev?: boolean) => void;
  error: FormikErrors<PostAttachedFile> | null;
}) => {
  const [editing, setEditing] = useState(false);
  return (
    <Card className="w-full">
      <CardBody className="flex flex-col gap-2">
        <div className="flex justify-between items-start w-full gap-4">
          <div className="flex gap-4 flex-col flex-1">
            {editing ? (
                <CustomInputWithoutFormik
                type="text"
                placeholder="Agregue una etiqueta descriptiva"
                description="Por ejemplo: manual de instrucciones"
                label="Etiqueta"
                isInvalid={!attachedFile.label}
                errorMessage={"Agregue una etiqueta"}
                value={attachedFile.label}
                onChange={(e) =>
                  onLabelChange(e.target.value, attachedFile._id, true)
                }
                />
            ) : (
                <span className="text-sm lg:text-base">{attachedFile.label}</span>
            )}
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
              {attachedFile.url}
            </Chip>
            <p className="text-xs lg:text-sm italic">Archivo subido anteriormente</p>
          </div>
          <div className="flex gap-2 mt-6">
            <Button
              isIconOnly
              aria-label={editing ? "Guardar cambios" : "Editar etiqueta"}
              variant="flat"
              radius="full"
              color="secondary"
              className="mb-2"
              onPress={() => setEditing(!editing)}
            >
              {editing ? <FaCheck /> : <FaPencil />}
            </Button>
            <Button
              isIconOnly
              aria-label={"Eliminar archivo " + attachedFile.label}
              variant="flat"
              radius="full"
              color="danger"
              className="mb-2"
              onPress={() => onRemove(attachedFile._id, true)}
            >
              <FaX />
            </Button>
          </div>
        </div>
        {error?.url && <p className="text-red-500 text-sm">{error.url}</p>}
        {error?.label && <p className="text-red-500 text-sm">{error.label}</p>}
      </CardBody>
    </Card>
  );
};

export default PrevAttachedFile;
