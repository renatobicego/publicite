"use client";
import { Good, Service } from "@/types/postTypes";
import { getPostInitialValues } from "./initialValues";
import { Form, Formik, FormikErrors } from "formik";
import { goodValidation } from "@/app/(root)/crear/anuncio/components/CreateGood/goodValidation";
import { serviceValidation } from "@/app/(root)/crear/anuncio/components/CreateService/serviceValidation";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useEffect, useState } from "react";
import useUploadFiles from "@/utils/hooks/useUploadFiles";
import { Button, Divider } from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import TitleDescription from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/TitleDescription";
import PriceCategory from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/PriceCategory";
import Condition from "@/app/(root)/crear/anuncio/components/CreateGood/Condition";
import AccordionInputs from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/AccordionInputs/AccordionInputs";
import UploadImages from "@/app/(root)/crear/anuncio/components/Upload/UploadImages";
import { useAttachedFiles } from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";

const EditPostForm = ({ postData }: { postData: Good | Service }) => {
  const { postType } = postData;
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const { attachedFiles, setPrevAttachedFiles } = useAttachedFiles();
  useEffect(() => {
    setPrevAttachedFiles(postData.attachedFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { progress, submitFiles } = useUploadFiles(images, attachedFiles);
  const initialValues = getPostInitialValues(postData, postType);
  const handleSubmit = () => {};
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={
        postType === "good" ? goodValidation : serviceValidation
      }
    >
      {({ isSubmitting, errors, values, setValues }) => (
        <Form className="w-full flex gap-4 items-start">
          <UploadImages
            files={images}
            setFiles={setImages}
            type={postType as any}
          />
          <div className="flex flex-col gap-4 flex-1 max-md:w-full">
            <TitleDescription errors={errors} />
            <PriceCategory errors={errors} />
            <Condition errors={errors} />
            <Divider />
            <AccordionInputs
              errors={errors}
              setValues={setValues}
              isEditing
              isService={postType === "service"}
            />
            <RequiredFieldsMsg />
            <div className="flex items-center gap-2 ">
              <Button
                onPress={() => router.back()}
                color="danger"
                variant="light"
                radius="full"
              >
                Cancelar
              </Button>
              <PrimaryButton
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
                type="submit"
                className="mt-4"
              >
                {isSubmitting ? `Editando ${progress}%` : "Editar Anuncio"}
              </PrimaryButton>
            </div>
            {Object.keys(errors).length > 0 && (
              <p className="text-danger text-sm">
                {(errors as FormikErrors<Good>).imagesUrls
                  ? (errors as FormikErrors<Good>).imagesUrls
                  : "Por favor corrija los errores"}
              </p>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default EditPostForm;
