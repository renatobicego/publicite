import { AttachedFileValues, GoodPostValues } from "@/types/postTypes";
import { Form, Formik, FormikHelpers } from "formik";
import { goodValidation } from "./goodValidation";
import TitleDescription from "../CreateForm/inputs/TitleDescription";
import PriceCategory from "../CreateForm/inputs/PriceCategory";
import { Divider } from "@nextui-org/react";
import Condition from "./Condition";
import PlacePicker from "../CreateForm/inputs/PlacePicker";
import AccordionInputs from "../CreateForm/inputs/AccordionInputs/AccordionInputs";
import { useState } from "react";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { useUser } from "@clerk/nextjs";
import { useUploadThing } from "@/app/utils/uploadThing";
import { toastifyError, toastifySuccess } from "@/app/utils/functions/toastify";
import { getLocalTimeZone, today } from "@internationalized/date";
import { createPost } from "../../actions";
import { useRouter } from "next/navigation";
import { POSTS } from "@/app/utils/data/urls";
import useUploadFiles from "@/app/utils/hooks/useUploadFiles";

const CreateGood = ({ files }: { files: File[] }) => {
  const { user } = useUser();
  console.log(user?.publicMetadata)
  const initialValues: GoodPostValues = {
    attachedFiles: [],
    description: "",
    title: "",
    price: undefined,
    category: "",
    author: (user?.publicMetadata.mongoId as string) || "",
    condition: undefined,
    imagesUrls: [],
    location: {
      lat: undefined,
      lng: undefined,
      description: "",
      userSetted: false,
    },
    postType: "good",
    visibility: {
      post: "public",
      socialMedia: "public",
    },
    brand: undefined,
    modelType: undefined,
    year: undefined,
    createAt: today(getLocalTimeZone()).toString(),
  };
  const router = useRouter();
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileValues[]>([]);
  const { progress, submitFiles } = useUploadFiles(files, attachedFiles);

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
      validationSchema={goodValidation}
    >
      {({ isSubmitting, errors, setFieldValue, values }) => {
        return (
          <Form className="flex flex-col gap-4">
            <TitleDescription errors={errors} />
            <PriceCategory errors={errors} />
            <Condition errors={errors} />
            <Divider />
            <h6>Seleccione su ubicación</h6>
            <PlacePicker
              location={values.location}
              setFieldValue={setFieldValue}
              error={errors.location}
            />
            <AccordionInputs
              errors={errors}
              attachedFiles={attachedFiles}
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

export default CreateGood;
