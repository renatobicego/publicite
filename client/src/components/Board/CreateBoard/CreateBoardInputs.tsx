import { Chip } from "@nextui-org/react";
import { Field, FormikErrors } from "formik";
import { PostBoard } from "@/types/board";
import { memo, SetStateAction } from "react";
import AnnotationsInputs from "../inputs/AnnotationsInputs";
import KeywordsInput from "../inputs/KeywordsInput";
import { visibilityItems } from "@/utils/data/selectData";
import { CustomSelect } from "../../inputs/CustomInputs";

const CreateBoardInputs = ({
  setValues,
  values,
  textColor,
  borderColor,
}: {
  setValues: (
    values: SetStateAction<PostBoard>,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<PostBoard>>;
  values: PostBoard;
  textColor: string;
  borderColor: string;
}) => {
  return (
    <>
      {values.annotations.length > 0 && (
        <ul className="flex flex-col gap-2 list-inside list-disc">
          {values.annotations.map((annotation, index) => (
            <li className="text-sm" key={index}>
              {annotation}
            </li>
          ))}
        </ul>
      )}
      <AnnotationsInputs setValues={setValues} textColor={textColor} />
      <KeywordsInput setValues={setValues} textColor={textColor} />
      {values.keywords.length > 0 && (
        <div className="flex gap-1 items-center">
          {values.keywords.map((keyword, index) => (
            <Chip
              size="sm"
              key={index}
              color="default"
              variant="bordered"
              className={`${textColor} ${borderColor}`}
            >
              {keyword}
            </Chip>
          ))}
        </div>
      )}
      <Field
        as={CustomSelect}
        items={visibilityItems}
        disallowEmptySelection
        textColor={`!${textColor}`}
        getItemValue={(item: any) => item.value}
        getItemTextValue={(item: any) => item.label}
        getItemLabel={(item: any) => item.label}
        name="visibility"
        className="text-white"
        label="Visibilidad de la Pizarra"
        placeholder="¿Quién puede ver la pizarra?"
        aria-label="visibilidad de la pizarra"
      />
    </>
  );
};

export default memo(CreateBoardInputs);
