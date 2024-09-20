"use client";
import { AttachedFileValues, PetitionPostValues } from "@/types/postTypes";
import { Form, Formik, FormikHelpers } from "formik";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { useUser } from "@clerk/nextjs";
import { getLocalTimeZone, today } from "@internationalized/date";
import { petitionValidation } from "./petititonValidation";
import TitleDescription from "../anuncio/components/CreateForm/inputs/TitleDescription";
import { Divider } from "@nextui-org/react";
import PlacePicker from "../anuncio/components/CreateForm/inputs/PlacePicker";
import PriceRangeCategory from "./PriceRangeCategory";
import Visibility from "../anuncio/components/CreateForm/inputs/AccordionInputs/Visibility";
import { createPost } from "../anuncio/actions";
import { toastifyError, toastifySuccess } from "@/app/utils/functions/toastify";
import { useRouter } from "next/navigation";
import { POSTS } from "@/app/utils/data/urls";
import { useState } from "react";
import useUploadFiles from "@/app/utils/hooks/useUploadFiles";
import AttachedFiles from "../anuncio/components/CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFiles";
import PetitionType from "./PetitionType";

const CreatePetition = () => {
  const { user } = useUser();
  const initialValues: PetitionPostValues = {
    attachedFiles: [],
    description: "",
    title: "",
    price: undefined,
    category: "",
    author: (user?.publicMetadata.mongoId as string) || "",
    location: {
      lat: undefined,
      lng: undefined,
      description: "",
      userSetted: false,
    },
    postType: "petition",
    visibility: {
      post: "public",
      socialMedia: "public",
    },
    createAt: today(getLocalTimeZone()).toString(),
    petitionType: undefined,
    frequencyPrice: undefined,
    toPrice: undefined,
  };

  const router = useRouter();
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileValues[]>([]);
  const { progress, submitFiles } = useUploadFiles([], attachedFiles, true);

  const handleSubmit = async (
    values: PetitionPostValues,
    actions: FormikHelpers<PetitionPostValues>
  ) => {
    const newValuesWithUrlFiles = await submitFiles(values, actions);
    if (!newValuesWithUrlFiles) {
      actions.setSubmitting(false);
      return;
    };
    values = newValuesWithUrlFiles;
    const dbLocation = {
      location: {
        type: "Point",
        coordinates: [values.location.lat, values.location.lng],
      },
      description: values.location.description,
      userSetted: values.location.userSetted,
    };

    const attachedFiles = values.attachedFiles.map((file) => ({
      url: file.url,
      label: file.label,
    }));

    console.log(values);
    const resApi = await createPost({
      ...values,
      location: dbLocation,
      attachedFiles,
      category: [values.category],
    });
    if (resApi.error) {
      toastifyError(resApi.error);
      return;
    }

    toastifySuccess("Anuncio creado exitosamente");
    router.push(`${POSTS}/${resApi.id}`);
  };
  return (
    <Formik
      // validateOnBlur={false}
      // validateOnChange={false}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={petitionValidation}
    >
      {({ isSubmitting, errors, setFieldValue, values }) => {
        console.log(values.price)

        return (
          <Form className="flex flex-col gap-4 w-full">
            <div className="flex gap-8 md:gap-4 w-full max-md:flex-col">
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <TitleDescription errors={errors} />
                <PetitionType errors={errors.petitionType} />
                <Divider />
                <h6>Busque su ubicación o seleccionela en el mapa</h6>
                <PlacePicker
                  location={values.location}
                  setFieldValue={setFieldValue}
                  error={errors.location}
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <PriceRangeCategory setFieldValue={setFieldValue} errors={errors} />
                <Visibility errors={errors} />
                <div className="flex lg:px-4 flex-col gap-4">
                  <h6>Archivos Adjuntos (opcional)</h6>
                  <AttachedFiles
                    attachedFiles={attachedFiles}
                    setAttachedFiles={setAttachedFiles}
                    errors={errors.attachedFiles}
                    maxFiles={1}
                  />
                </div>
              </div>
            </div>
            <PrimaryButton
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
              className="mt-4 self-start"
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
