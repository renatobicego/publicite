import { Field, FormikErrors } from "formik";
import { PostBoard } from "@/types/board";
import { memo, SetStateAction } from "react";
import AnnotationsInputs from "../inputs/AnnotationsInputs";
import KeywordsInput from "../inputs/KeywordsInput";
import { visibilityRegisteredItems } from "@/utils/data/selectData";
import { CustomSelect } from "../../inputs/CustomInputs";
import KeywordAdded from "../inputs/KeywordAdded";
import AnnotationAdded from "../inputs/AnnotationAdded";

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
  const deleteKeyword = (keyword: string) => {
    setValues((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };
  const deleteAnnotation = (annotation: string) => {
    setValues((prev) => ({
      ...prev,
      annotations: prev.annotations.filter((a) => a !== annotation),
    }));
  };
  return (
    <>
      {values.annotations.length > 0 && (
        <ul className="flex flex-col gap-2 list-inside list-disc">
          {values.annotations.map((annotation, index) => (
            <AnnotationAdded
              key={index}
              annotation={annotation}
              deleteAnnotation={deleteAnnotation}
            />
          ))}
        </ul>
      )}
      <AnnotationsInputs setValues={setValues} textColor={textColor} />
      <div className="w-full">
        <KeywordsInput setValues={setValues} textColor={textColor} />
        {values.keywords.length > 0 && (
          <div className="flex gap-1 items-center max-w-full overflow-x-auto">
            {values.keywords.map((keyword, index) => (
              <KeywordAdded
                key={index}
                keyword={keyword}
                deleteKeyword={deleteKeyword}
                borderColor={borderColor}
                textColor={textColor}
              />
            ))}
          </div>
        )}
      </div>
      <Field
        as={CustomSelect}
        items={visibilityRegisteredItems}
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
