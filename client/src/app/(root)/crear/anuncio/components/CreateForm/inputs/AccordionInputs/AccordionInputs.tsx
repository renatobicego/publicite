import { Accordion, AccordionItem } from "@nextui-org/react";
import Visibility from "./Visibility";
import { FormikErrors } from "formik";
import {
  GoodPostValues,
  PostBehaviourType,
  ServicePostValues,
} from "@/types/postTypes";
import AdditionalGoodData from "./AdditionalGoodData";
import AttachedFiles from "./AttachedFIles/AttachedFiles";
import { memo, SetStateAction } from "react";
import { FaChevronLeft } from "react-icons/fa6";

const AccordionInputs = ({
  errors,
  isService = false,
  isEditing = false,
  postBehaviourType,
}: {
  errors: FormikErrors<GoodPostValues> | FormikErrors<ServicePostValues>;
  isService?: boolean;
  isEditing?: boolean;
  postBehaviourType: PostBehaviourType;
}) => {
  const goodErrors = errors as FormikErrors<GoodPostValues>;

  const generateClassname = (error: any) => {
    return {
      title: `${
        error ? "!text-danger" : ""
      } text-text-color font-semibold max-md:text-sm text-base`,
      indicator: `${error ? "text-danger" : ""}"`,
      subtitle: "text-danger",
    };
  };
  return (
    <Accordion>
      <AccordionItem
        HeadingComponent={"h6"}
        key="visibilidad"
        aria-label="Configuración de Visibilidad"
        indicator={<FaChevronLeft className="size-3" />}
        title="Configuración de Visibilidad"
        subtitle={errors.visibility ? "Corrija los errores" : ""}
        classNames={generateClassname(errors.visibility)}
      >
        <Visibility errors={errors} postBehaviourType={postBehaviourType} />
      </AccordionItem>
      <AccordionItem
        HeadingComponent={"h6"}
        key="dataAdicional"
        aria-label="Datos Adicionales"
        title="Datos Adicionales"
        indicator={<FaChevronLeft className="size-3" />}
        subtitle={
          goodErrors.year || goodErrors.brand || goodErrors.modelType
            ? "Corrija los errores"
            : ""
        }
        className={isService ? "hidden" : ""}
        classNames={generateClassname(
          goodErrors.year || goodErrors.brand || goodErrors.modelType
        )}
      >
        <AdditionalGoodData errors={errors} />
      </AccordionItem>
      <AccordionItem
        HeadingComponent={"h6"}
        key="attachedFiles"
        aria-label="Archivos Adjuntos"
        indicator={<FaChevronLeft className="size-3" />}
        title="Archivos Adjuntos"
        subtitle={errors.attachedFiles ? "Corrija los errores" : ""}
        classNames={generateClassname(errors.attachedFiles)}
      >
        <AttachedFiles errors={errors.attachedFiles} isEditing={isEditing} />
      </AccordionItem>
    </Accordion>
  );
};

export default memo(AccordionInputs);
