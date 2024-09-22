import { AttachedFileValues, GoodPostValues, ServicePostValues } from "@/types/postTypes";
import { Form, Formik, FormikHelpers } from "formik";
import TitleDescription from "../CreateForm/inputs/TitleDescription";
import PriceCategory from "../CreateForm/inputs/PriceCategory";
import { Divider } from "@nextui-org/react";
import PlacePicker from "../CreateForm/inputs/PlacePicker";
import AccordionInputs from "../CreateForm/inputs/AccordionInputs/AccordionInputs";
import { useState } from "react";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { useUser } from "@clerk/nextjs";
import { toastifyError, toastifySuccess } from "@/app/utils/functions/toastify";
import { serviceValidation } from "./serviceValidation";
import { getLocalTimeZone, today } from "@internationalized/date";
import useUploadFiles from "@/app/utils/hooks/useUploadFiles";
import { createPost } from "../../actions";
import { POSTS } from "@/app/utils/data/urls";
import { useRouter } from "next/navigation";


const CreateService = ({ files }: { files: File[] }) => {
  const { user } = useUser();
  const initialValues: ServicePostValues = {
    attachedFiles: [],
    description: "",
    title: "",
    price: undefined,
    frequencyPrice: undefined,
    category: "",
    author: (user?.publicMetadata.mongoId as string) || "",
    imagesUrls: [],
    location: {
      lat: undefined,
      lng: undefined,
      description: "",
      userSetted: false
    },
    postType: "service",
    visibility: {
      post: "public",
      socialMedia: "public",
    },
    createAt: today(getLocalTimeZone()).toString(),
  };

  const [attachedFiles, setAttachedFiles] = useState<AttachedFileValues[]>([]);
  const { progress, submitFiles } = useUploadFiles(files, attachedFiles);
  const router = useRouter();

  const handleSubmit = async (
    values: GoodPostValues,
    actions: FormikHelpers<GoodPostValues>
  ) => {
    const newValuesWithUrlFiles = await submitFiles(values, actions);
    if (!newValuesWithUrlFiles) return;
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
      validateOnBlur={false}
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={serviceValidation}
    >
      {({ isSubmitting, errors, setFieldValue, values }) => {
        return (
          <Form className="flex flex-col gap-4">
            <TitleDescription errors={errors} />
            <PriceCategory errors={errors} isService={true} />
            <Divider />
            <h6>Busque su ubicación o seleccionela en el mapa</h6>
            <PlacePicker
              location={values.location}
              setFieldValue={setFieldValue}
              error={errors.location}
            />
            <AccordionInputs
              errors={errors}
              attachedFiles={attachedFiles}
              isService={true}
              setAttachedFiles={setAttachedFiles}
            />
            <PrimaryButton
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
              className="mt-4"
            >
              {isSubmitting ? `Publicando ${progress}%` : "Crear Anuncio"}
            </PrimaryButton>
            {Object.keys(errors).length > 0 && (
              <p className="text-danger text-sm">
                {errors.imagesUrls
                  ? errors.imagesUrls
                  : "Por favor corrija los errores"}
              </p>
            )}
          </Form>
        );
      }}
    </Formik>
  );
};

export default CreateService;
