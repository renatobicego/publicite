import { GoodPostValues, ServicePostValues } from "@/types/postTypes";
import { Form, Formik, FormikHelpers } from "formik";
import TitleDescription from "../CreateForm/inputs/TitleDescription";
import PriceCategory from "../CreateForm/inputs/PriceCategory";
import { Divider } from "@nextui-org/react";
import PlacePicker from "../CreateForm/inputs/PlacePicker";
import AccordionInputs from "../CreateForm/inputs/AccordionInputs/AccordionInputs";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { serviceValidation } from "./serviceValidation";
import { getLocalTimeZone, today } from "@internationalized/date";
import useUploadFiles from "@/utils/hooks/useUploadFiles";
import { createPost } from "../../../../../server/postActions";
import { POSTS } from "@/utils/data/urls";
import { useRouter } from "next-nprogress-bar";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { useAttachedFiles } from "../CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";

const CreateService = ({
  files,
  userCanPublishPost,
  userId,
}: {
  files: File[];
  userCanPublishPost: boolean;
  userId?: string;
}) => {
  const initialValues: ServicePostValues = {
    attachedFiles: [],
    description: "",
    title: "",
    price: undefined,
    frequencyPrice: undefined,
    category: "",
    author: userId || "",
    imagesUrls: [],
    geoLocation: {
      lat: undefined,
      lng: undefined,
      description: "",
      userSetted: false,
      ratio: 5,
    },
    postType: "service",
    visibility: {
      post: "public",
      socialMedia: "public",
    },
    createAt: today(getLocalTimeZone()).toString(),
  };

  const { attachedFiles } = useAttachedFiles();

  const { progress, submitFiles } = useUploadFiles(files, attachedFiles);
  const router = useRouter();

  const handleSubmit = async (
    values: GoodPostValues,
    actions: FormikHelpers<GoodPostValues>
  ) => {
    if (!userCanPublishPost) {
      actions.setSubmitting(false);
      return;
    }
    const newValuesWithUrlFiles = await submitFiles(values, actions);
    if (!newValuesWithUrlFiles) {
      actions.setSubmitting(false);
      return;
    }
    values = newValuesWithUrlFiles;

    const dbLocation = {
      location: {
        type: "Point",
        coordinates: [values.geoLocation.lat, values.geoLocation.lng],
      },
      description: values.geoLocation.description,
      userSetted: values.geoLocation.userSetted,
      ratio: values.geoLocation.ratio,
    };

    const attachedFiles = values.attachedFiles.map((file) => ({
      url: file.url,
      label: file.label,
    }));

    const resApi = await createPost(
      {
        ...values,
        location: dbLocation,
        attachedFiles,
        category: [values.category],
      },
      userCanPublishPost
    );
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
            <TitleDescription errors={errors} setFieldValue={setFieldValue}/>
            <PriceCategory errors={errors} isService={true} />
            <Divider />
            <h6>Busque su ubicación o seleccionela en el mapa</h6>
            <PlacePicker
              location={values.geoLocation}
              setFieldValue={setFieldValue}
              error={errors.geoLocation}
            />
            <AccordionInputs errors={errors} isService={true} />
            <RequiredFieldsMsg />
            <PrimaryButton
              isDisabled={isSubmitting || !userCanPublishPost}
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
