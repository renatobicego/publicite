import { CustomInputWithoutFormik } from "@/components/inputs/CustomInputs";
import { PostBoard } from "@/types/board";
import { Button } from "@nextui-org/react";
import { FormikErrors } from "formik";
import { memo, SetStateAction, useState } from "react";
import { FaPlus } from "react-icons/fa6";
const KeywordsInput = ({
  setValues,
  textColor,
}: {
  setValues: (
    values: SetStateAction<PostBoard>,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PostBoard>>;
  textColor: string;
}) => {
  const [currentKeyword, setCurrentKeyword] = useState<string>("");

  return (
    <CustomInputWithoutFormik
      key={"keywords"}
      label="Palabras Clave (opcional)"
      aria-label="palabras clave"
      placeholder="Agregue una palabra"
      value={currentKeyword}
      classNames={{label: `!${textColor}`}}
      onValueChange={setCurrentKeyword}
      endContent={
        <Button
          onPress={() => {
            setCurrentKeyword("");
            setValues((prev) => ({
              ...prev,
              keywords: [...prev.keywords, currentKeyword],
            }));
          }}
          size="sm"
          radius="full"
          isIconOnly
          variant="light"
          color="primary"
        >
          <FaPlus />
        </Button>
      }
    />
  );
};

export default memo(KeywordsInput);