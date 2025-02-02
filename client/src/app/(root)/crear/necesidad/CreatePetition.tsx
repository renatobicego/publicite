"use client";
import { PetitionPostValues, PostBehaviourType } from "@/types/postTypes";
import { Form, Formik, FormikHelpers } from "formik";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { getLocalTimeZone, today } from "@internationalized/date";
import { petitionValidation } from "./petititonValidation";
import TitleDescription from "../anuncio/components/CreateForm/inputs/TitleDescription";
import { Divider } from "@nextui-org/react";
import PlacePicker from "../anuncio/components/CreateForm/inputs/PlacePicker";
import PriceRangeCategory from "./PriceRangeCategory";
import Visibility from "../anuncio/components/CreateForm/inputs/AccordionInputs/Visibility";
import { createPost } from "../../../server/postActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next-nprogress-bar";
import { POSTS } from "@/utils/data/urls";
import useUploadFiles from "@/utils/hooks/useUploadFiles";
import AttachedFiles from "../anuncio/components/CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFiles";
import PetitionType from "./PetitionType";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { useAttachedFiles } from "../anuncio/components/CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";

const CreatePetition = ({
  userId,
  postBehaviourType,
}: {
  userId?: string;
  postBehaviourType: PostBehaviourType;
}) => {
  const initialValues: PetitionPostValues = {
    attachedFiles: [],
    description: "",
    title: "",
    price: undefined,
    category: "",
    author: userId || "",
    geoLocation: {
      lat: undefined,
      lng: undefined,
      description: "",
      userSetted: false,
      ratio: 5,
    },
    postType: "petition",
    visibility: {
      post: postBehaviourType === "agenda" ? "contacts" : "public",
      socialMedia: "public",
    },
    createAt: today(getLocalTimeZone()).toString(),
    petitionType: undefined,
    frequencyPrice: undefined,
    toPrice: undefined,
    postBehaviourType,
  };

  const router = useRouter();
  const { attachedFiles } = useAttachedFiles();
  const { progress, submitFiles } = useUploadFiles([], attachedFiles, true);

  const handleSubmit = async (
    values: PetitionPostValues,
    actions: FormikHelpers<PetitionPostValues>
  ) => {
    const newValuesWithUrlFiles = await submitFiles(values, actions);
    if (!newValuesWithUrlFiles) {
      actions.setSubmitting(false);
      return;
    }
    values = newValuesWithUrlFiles;
    const dbLocation = {
      location: {
        type: "Point",
        coordinates: [values.geoLocation.lng, values.geoLocation.lat],
      },
      description: values.geoLocation.description,
      userSetted: values.geoLocation.userSetted,
      ratio: values.geoLocation.ratio
        ? values.geoLocation.ratio * 1000
        : 5 * 1000,
    };

    const attachedFiles = values.attachedFiles.map((file) => ({
      url: file.url,
      label: file.label,
    }));

    const resApi = await createPost(
      {
        ...values,
        geoLocation: dbLocation,
        attachedFiles,
        category: [values.category],
      },
      true
    );
    if (resApi.error) {
      toastifyError(resApi.error);
      actions.setSubmitting(false);
      return;
    }

    actions.resetForm();
    toastifySuccess(resApi.message as string);
    router.refresh();
    router.push(`${POSTS}/${resApi.id}`);
  };
  return (
    <Formik
      validateOnBlur={false}
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
      validationSchema={petitionValidation}
    >
      {({ isSubmitting, errors, setFieldValue, values }) => {
        return (
          <Form className="flex flex-col gap-4 w-full">
            <div className="flex gap-8 md:gap-4 w-full max-md:flex-col">
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <TitleDescription
                  errors={errors}
                  setFieldValue={setFieldValue}
                />
                <PetitionType errors={errors.petitionType} />
                <Divider />
                <h6>Busque su ubicación o seleccionela en el mapa</h6>
                <PlacePicker
                  location={values.geoLocation}
                  setFieldValue={setFieldValue}
                  error={errors.geoLocation}
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <PriceRangeCategory
                  setFieldValue={setFieldValue}
                  errors={errors}
                />
                <Visibility
                  errors={errors}
                  postBehaviourType={postBehaviourType}
                />
                <div className="flex lg:px-4 flex-col gap-4">
                  <h6>Archivos Adjuntos (opcional)</h6>
                  <AttachedFiles
                    errors={errors.attachedFiles}
                    maxFiles={1}
                    isEditing={false}
                  />
                </div>
              </div>
            </div>
            <RequiredFieldsMsg />
            <PrimaryButton
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
              className="self-start"
            >
              {isSubmitting
                ? attachedFiles.length > 0
                  ? `Publicando ${progress}%`
                  : "Publicando"
                : "Crear Necesidad"}
            </PrimaryButton>
            {Object.keys(errors).length > 0 && (
              <p className="text-danger text-sm">
                Por favor corrija los errores
              </p>
            )}
          </Form>
        );
      }}
    </Formik>
  );
};

export default CreatePetition;
