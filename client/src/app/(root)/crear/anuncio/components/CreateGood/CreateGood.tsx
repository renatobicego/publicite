import { GoodPostValues, PostBehaviourType } from "@/types/postTypes";
import { Form, Formik, FormikHelpers } from "formik";
import { goodValidation } from "./goodValidation";
import TitleDescription from "../CreateForm/inputs/TitleDescription";
import PriceCategory from "../CreateForm/inputs/PriceCategory";
import { Divider } from "@nextui-org/react";
import Condition from "./Condition";
import PlacePicker from "../CreateForm/inputs/PlacePicker";
import AccordionInputs from "../CreateForm/inputs/AccordionInputs/AccordionInputs";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { getLocalTimeZone, today } from "@internationalized/date";
import { createPost } from "../../../../../server/postActions";
import { POSTS } from "@/utils/data/urls";
import useUploadFiles from "@/utils/hooks/useUploadFiles";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { useAttachedFiles } from "../CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";
import { useRouter } from "next-nprogress-bar";

const CreateGood = ({
  files,
  userCanPublishPost,
  userId,
  postBehaviourType,
}: {
  files: File[];
  userCanPublishPost: boolean;
  userId?: string;
  postBehaviourType: PostBehaviourType;
}) => {
  const initialValues: GoodPostValues = {
    attachedFiles: [],
    description: "",
    title: "",
    price: undefined,
    category: "",
    author: userId || "",
    condition: undefined,
    imagesUrls: [],
    geoLocation: {
      lat: undefined,
      lng: undefined,
      description: "",
      userSetted: false,
      ratio: 5,
    },
    postType: "good",
    visibility: {
      post: postBehaviourType === "agenda" ? "contacts" : "public",
      socialMedia: "public",
    },
    brand: undefined,
    modelType: undefined,
    year: undefined,
    createAt: today(getLocalTimeZone()).toString(),
    postBehaviourType
  };
  const router = useRouter();
  const { attachedFiles } = useAttachedFiles();

  const { progress, submitFiles } = useUploadFiles(files, attachedFiles);

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
      validationSchema={goodValidation}
    >
      {({ isSubmitting, errors, setFieldValue, values }) => {
        return (
          <Form className="flex flex-col gap-4">
            <TitleDescription errors={errors} setFieldValue={setFieldValue} />
            <PriceCategory errors={errors} />
            <Condition errors={errors} />
            <Divider />
            <h6>Seleccione su ubicación</h6>
            <PlacePicker
              location={values.geoLocation}
              setFieldValue={setFieldValue}
              error={errors.geoLocation}
            />
            <AccordionInputs errors={errors} postBehaviourType={postBehaviourType} />
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

export default CreateGood;
