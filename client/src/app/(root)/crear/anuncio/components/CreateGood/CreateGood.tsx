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
import { toastifyError } from "@/app/utils/functions/toastify";
import { getLocalTimeZone, today } from "@internationalized/date";

const INITIAL_LOCATION = { lat: -34.6115643483578, lng: -58.38901999245833 };

const CreateGood = ({ files }: { files: File[] }) => {
  const { user } = useUser();
  const [progress, setProgress] = useState(0);
  const initialValues: GoodPostValues = {
    attachedFiles: [],
    description: "",
    title: "",
    price: undefined,
    category: "",
    author: user?.username || "",
    condition: undefined,
    imagesUrls: [],
    location: {
      lat: undefined,
      lng: undefined,
      description: "",
      userSetted: false
    },
    postType: "good",
    visibility: {
      post: "public",
      socialMedia: "public",
    },
    brand: undefined,
    model: undefined,
    year: undefined,
    createdAt: today(getLocalTimeZone()).toString(),
  };

  const [attachedFiles, setAttachedFiles] = useState<AttachedFileValues[]>([]);
  const { startUpload } = useUploadThing("fileUploader", {
    onUploadError: (e) => {
      toastifyError(`Error al subir el archivo/imagen: ${e.name}`);
    },
    onClientUploadComplete: () => {
      setProgress(0);
    },

    onUploadProgress: (value) => {
      setProgress(value);
    },
  });

  const handleSubmit = async (
    values: GoodPostValues,
    actions: FormikHelpers<GoodPostValues>
  ) => {
    if (!files.length) {
      actions.setFieldError(
        "imagesUrls",
        "Por favor agregue al menos una imagen"
      );
      return;
    }
    // Combine both files and attachedFiles into a single array for upload
    const combinedFiles = [...files, ...attachedFiles.map((file) => file.file)];

    const res = await startUpload(combinedFiles as File[]);
    if (!res || !res.length) {
      return;
    }

    // Separate URLs based on the origin of files
    const uploadedFileUrls = res
      .slice(0, files.length)
      .map((upload) => upload.url);
    const uploadedAttachedFileUrls = res.slice(files.length).map((upload, index) => ({
      url: upload.url,
      label: attachedFiles[index].label,
      _id: "",
    }));

    // Assign URLs to their respective fields in the form values
    values.imagesUrls = uploadedFileUrls;
    values.attachedFiles = uploadedAttachedFileUrls;

    console.log(values);
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
