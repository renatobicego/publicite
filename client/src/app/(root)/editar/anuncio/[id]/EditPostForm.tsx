"use client";
import { Good, Service } from "@/types/postTypes";
import { getPostInitialValues } from "./initialValues";
import { Field, Form, Formik, FormikErrors, FormikHelpers } from "formik";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useEffect, useState } from "react";
import useUploadFiles from "@/utils/hooks/useUploadFiles";
import { Button, Divider, Link } from "@nextui-org/react";
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
import { handleFileSubmission } from "./handleFileSubmission";
import ChangeBehaviourLink from "./ChangeBehaviourLink";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { CustomDateInput } from "@/components/inputs/CustomInputs";

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
  const initialValues = getPostInitialValues(
    postData,
    postType as "good" | "service"
  );

  const handleSubmit = async (values: any, actions: FormikHelpers<any>) => {
    if (
      values.endDate < today(getLocalTimeZone()).toString() ||
      values.endDate > today(getLocalTimeZone()).add({ years: 1 }).toString()
    ) {
      actions.setFieldError(
        "endDate",
        "La fecha de finalización debe ser posterior a la fecha actual y no más de 1 año"
      );
      actions.setSubmitting(false);
      return;
    }
    // check if all images were deleted and no new images were added
    if (
      newImages.length === 0 &&
      deletedImages.length === values.imagesUrls.length
    ) {
      actions.setFieldError(
        "imagesUrls",
        "Por favor agrega al menos una imagen"
      );
      actions.setSubmitting(false);
      return false;
    }

    // hanlde file submission
    const newValuesWithUrlFiles = await handleFileSubmission(
      deletedImages,
      values,
      actions,
      deleteFiles,
      prevAttachedFilesDeleted,
      submitFiles
    );
    // check if there was an error
    if (!newValuesWithUrlFiles) {
      actions.setFieldError(
        "imagesUrls",
        "Error al subir las imágenes. Por favor intenta de nuevo."
      );
      actions.setSubmitting(false);
      return;
    }

    // edit post
    const resApi = await editPost(
      {
        ...newValuesWithUrlFiles,
        category: [values.category],
      },
      postData._id,
      postData.author.username
    );
    if (resApi.error) {
      toastifyError(resApi.error);
      return;
    }
    actions.resetForm();
    toastifySuccess("Anuncio editado exitosamente");
    router.refresh();
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
      {({ isSubmitting, errors, values, setFieldValue, setValues }) => {
        return (
          <Form className="w-full max-md:flex-col flex gap-4 items-start">
            <div className="flex flex-col gap-4 flex-1 max-md:w-full">
              <UploadImages
                files={newImages}
                setFiles={setNewImages}
                isVideoUploaded={values.imagesUrls.some((url) =>
                  isVideo(url, true)
                )}
                type={postType as any}
                prevFilesCount={values.imagesUrls.length}
                customClassname="md:w-full"
              />
              <h6>Imagenes Subidas Anteriormente</h6>
              <div
                className="flex gap-2 lg:gap-4 w-full flex-wrap max-md:flex-nowrap 
              max-md:overflow-x-auto max-md:mb-4 pb-1"
              >
                {values.imagesUrls &&
                  [...values.imagesUrls, ...deletedImages].map((url, index) => (
                    <ImagePreview
                      image={url}
                      key={index}
                      isMaxFileCountExceeded={
                        values.imagesUrls.length + newImages.length > 10
                      }
                      deletedImages={deletedImages}
                      setDeletedImages={setDeletedImages}
                      setValues={setValues}
                    />
                  ))}
              </div>
            </div>
            <div
              id="edit-post-form"
              className="flex flex-col gap-4 flex-1 max-md:w-full"
            >
              <ChangeBehaviourLink
                id={postData._id}
                postBehaviourType={postData.postBehaviourType}
              />
              <TitleDescription errors={errors} setFieldValue={setFieldValue} />
              <PriceCategory
                errors={errors}
                isService={postType === "service"}
              />
              {postType === "good" && <Condition errors={errors} />}
              <Field
                as={CustomDateInput}
                name="endDate"
                errorMessage={errors.endDate}
                isInvalid={!!errors.endDate}
                label="Fecha de Vencimiento"
                aria-label="fecha de vencimiento"
                description="La fecha de vencimiento es la fecha en la que el anuncio se considera vencido. Luego podrá cambiarla o renovarla."
                onChange={(value: CalendarDate) =>
                  setFieldValue("endDate", value ? value.toString() : "")
                }
                minValue={today(getLocalTimeZone())}
                maxValue={today(getLocalTimeZone()).add({ years: 1 })}
              />
              <Divider />
              <AccordionInputs
                errors={errors}
                isEditing
                isService={postType === "service"}
                postBehaviourType={postData.postBehaviourType}
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
