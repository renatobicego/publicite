import { CustomInputWithoutFormik } from "@/components/inputs/CustomInputs";
import { Board, PostBoard } from "@/types/board";
import { Button } from "@nextui-org/react";
import { FormikErrors } from "formik";
import { memo, SetStateAction, useState } from "react";
import { FaPlus } from "react-icons/fa6";

const AnnotationsInputs = ({
  setValues,
  textColor,
}: {
  setValues: (
    values: SetStateAction<PostBoard>,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PostBoard>>;
  textColor: string;
}) => {
  const [currentAnnotation, setCurrentAnnotation] = useState<string>("");
  return (
    <div className="w-full flex flex-col gap-1 items-start">
      <CustomInputWithoutFormik
        key={"annotations"}
        label="Anotaciones (opcional)"
        aria-label="anotaciones"
        placeholder="Agregue una anotación"
        description="Presione el botón + para agregar la anotación"
        classNames={{ label: `!${textColor}` }}
        value={currentAnnotation}
        onValueChange={setCurrentAnnotation}
        endContent={
          <Button
            onPress={() => {
              setCurrentAnnotation("");
              setValues((prev) => ({
                ...prev,
                annotations: [...prev.annotations, currentAnnotation],
              }));
            }}
            isDisabled={currentAnnotation.trim() === ""}
            size="sm"
            radius="full"
            variant="bordered"
            color="primary"
            isIconOnly
            aria-label="Agregar anotación"
          >
            <FaPlus />
          </Button>
        }
      />
      <Button
        onPress={() => {
          setCurrentAnnotation("");
          setValues((prev) => ({
            ...prev,
            annotations: [...prev.annotations, currentAnnotation],
          }));
        }}
        isDisabled={currentAnnotation.trim() === ""}
        radius="full"
        color="primary"
        startContent={<FaPlus />}
        size="sm"
      >
        Agregar Anotación
      </Button>
    </div>
  );
};

export default memo(AnnotationsInputs);
