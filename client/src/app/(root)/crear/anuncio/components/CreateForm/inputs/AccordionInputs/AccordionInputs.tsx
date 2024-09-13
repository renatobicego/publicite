import { Accordion, AccordionItem } from "@nextui-org/react";
import Visibility from "./Visibility";
import { FormikErrors } from "formik";
import {
  AttachedFileValues,
  GoodPostValues,
  ServicePostValues,
} from "@/types/postTypes";
import AdditionalGoodData from "./AdditionalGoodData";
import AttachedFiles from "./AttachedFIles/AttachedFiles";
import { Dispatch, SetStateAction } from "react";
import { FaChevronLeft } from "react-icons/fa6";

const AccordionInputs = ({
  errors,
  isService = false,
  attachedFiles,
  setAttachedFiles,
}: {
  errors: FormikErrors<GoodPostValues> | FormikErrors<ServicePostValues>;
  isService?: boolean;
  attachedFiles: AttachedFileValues[];
  setAttachedFiles: Dispatch<SetStateAction<AttachedFileValues[]>>;
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
        key="visibilidad"
        aria-label="Configuración de Visibilidad"
        indicator={<FaChevronLeft className="size-3" />}
        title="Configuración de Visibilidad"
        subtitle={errors.visibility ? "Corrija los errores" : ""}
        classNames={generateClassname(errors.visibility)}
      >
        <Visibility errors={errors} />
      </AccordionItem>
      <AccordionItem
        key="dataAdicional"
        aria-label="Datos Adicionales"
        title="Datos Adicionales"
        indicator={<FaChevronLeft className="size-3" />}
        subtitle={
          goodErrors.year || goodErrors.brand || goodErrors.model
            ? "Corrija los errores"
            : ""
        }
        className={isService ? "hidden" : ""}
        classNames={generateClassname(
          goodErrors.year || goodErrors.brand || goodErrors.model
        )}
      >
        <AdditionalGoodData errors={errors} />
      </AccordionItem>
      <AccordionItem
        key="attachedFiles"
        aria-label="Archivos Adjuntos"
        indicator={<FaChevronLeft className="size-3" />}
        title="Archivos Adjuntos"
        subtitle={errors.attachedFiles ? "Corrija los errores" : ""}
        classNames={generateClassname(errors.attachedFiles)}
      >
        <AttachedFiles
          errors={errors.attachedFiles}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
        />
      </AccordionItem>
    </Accordion>
  );
};

export default AccordionInputs;
