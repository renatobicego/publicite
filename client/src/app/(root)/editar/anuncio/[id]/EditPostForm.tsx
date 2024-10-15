"use client";
import { Good, PostAttachedFile, Service } from "@/types/postTypes";
import { getPostInitialValues } from "./initialValues";
import { Form, Formik, FormikErrors, FormikHelpers } from "formik";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useEffect, useState } from "react";
import useUploadFiles from "@/utils/hooks/useUploadFiles";
import { Button, Divider, image } from "@nextui-org/react";
import { useRouter } from "next-nprogress-bar";
import TitleDescription from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/TitleDescription";
import PriceCategory from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/PriceCategory";
import Condition from "@/app/(root)/crear/anuncio/components/CreateGood/Condition";
import AccordionInputs from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/AccordionInputs/AccordionInputs";
import UploadImages from "@/app/(root)/crear/anuncio/components/Upload/UploadImages";
import { useAttachedFiles } from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";
import ImagePreview from "./ImagePreview";
import { isVideo } from "@/utils/functions/utils";
import { editPost } from "@/app/server/postActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { POSTS } from "@/utils/data/urls";
import { goodEditValidation } from "@/app/(root)/crear/anuncio/components/CreateGood/goodValidation";
import { serviceEditValidation } from "@/app/(root)/crear/anuncio/components/CreateService/serviceValidation";

const EditPostForm = ({ postData }: { postData: Good | Service }) => {
  const { postType } = postData;
  const router = useRouter();
  const [newImages, setNewImages] = useState<File[]>([]);
  const { attachedFiles, setPrevAttachedFiles, prevAttachedFilesDeleted } =
    useAttachedFiles();
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  useEffect(() => {
    setPrevAttachedFiles(postData.attachedFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { progress, submitFiles, deleteFiles } = useUploadFiles(
    newImages,
    attachedFiles,
    false,
    true
  );
  const initialValues = getPostInitialValues(postData, postType as any);

  const handleSubmit = async (values: any, actions: FormikHelpers<any>) => {
    await deleteFiles([
      ...deletedImages,
      ...prevAttachedFilesDeleted.map((file) => file.url),
    ]);
    const newValuesWithUrlFiles = await submitFiles(values, actions);
    if (!newValuesWithUrlFiles) {
      actions.setSubmitting(false);
      return;
    }
    values = {
      ...newValuesWithUrlFiles,
      imagesUrls: newValuesWithUrlFiles.imagesUrls.filter(
        (url: string) => !deletedImages.includes(url)
      ),
      attachedFiles: newValuesWithUrlFiles.attachedFiles.filter(
        (file: PostAttachedFile) =>
          !prevAttachedFilesDeleted.some(
            (deletedFile) => deletedFile.url === file.url
          )
      ),
    };

    const resApi = await editPost(
      {
        ...values,
        category: [values.category],
      },
      postData._id,
      postData.author.username
    );
    if (resApi.error) {
      toastifyError(resApi.error);
      return;
    }

    toastifySuccess("Anuncio editado exitosamente");
    router.push(`${POSTS}/${resApi.id}`);
  };
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={
        postType === "good" ? goodEditValidation : serviceEditValidation
      }
    >
      {({ isSubmitting, errors, values }) => {
        return (
          <Form className="w-full max-md:flex-col flex gap-4 items-start">
            <div className="flex flex-col gap-4 flex-1 max-md:w-full">
              <UploadImages
                files={newImages}
                setFiles={setNewImages}
                isVideoUploaded={values.imagesUrls.some((url) => isVideo(url))}
                type={postType as any}
                prevFilesCount={values.imagesUrls.length - deletedImages.length}
                customClassname="md:w-full"
              />
              <h6>Imagenes Subidas Anteriormente</h6>
              <div
                className="flex gap-2 lg:gap-4 w-full flex-wrap max-md:flex-nowrap 
              max-md:overflow-x-auto max-md:mb-4 pb-1"
              >
                {values.imagesUrls &&
                  values.imagesUrls.map((url, index) => (
                    <ImagePreview
                      image={url}
                      key={index}
                      isMaxFileCountExceeded={
                        values.imagesUrls.length + newImages.length > 10
                      }
                      deletedImages={deletedImages}
                      setDeletedImages={setDeletedImages}
                    />
                  ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 flex-1 max-md:w-full">
              <TitleDescription errors={errors} />
              <PriceCategory errors={errors} />
              <Condition errors={errors} />
              <Divider />
              <AccordionInputs
                errors={errors}
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
        );
      }}
    </Formik>
  );
};

export default EditPostForm;
