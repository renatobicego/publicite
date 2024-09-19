"use client";
import { PetitionPostValues } from "@/types/postTypes";
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

const CreatePetition = () => {
  const { user } = useUser();
  const initialValues: PetitionPostValues = {
    attachedFiles: [],
    description: "",
    title: "",
    price: undefined,
    category: "",
    author: user?.username || "",
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
    createdAt: today(getLocalTimeZone()).toString(),
    petitionType: undefined,
    frequencyPrice: undefined,
    toPrice: undefined,
  };

  const handleSubmit = async (
    values: PetitionPostValues,
    actions: FormikHelpers<PetitionPostValues>
  ) => {
    console.log(values);
  };
  return (
    <Formik
      validateOnBlur={false}
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={petitionValidation}
    >
      {({ isSubmitting, errors, setFieldValue, values }) => {
        return (
          <Form className="flex flex-col gap-4 w-full">
            <div className="flex gap-8 md:gap-4 w-full max-md:flex-col">
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <TitleDescription errors={errors} />
                <Divider />
                <h6>Seleccione su ubicación</h6>
                <PlacePicker
                  location={values.location}
                  setFieldValue={setFieldValue}
                  error={errors.location}
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <PriceRangeCategory errors={errors} />
                <Visibility errors={errors} />
              </div>
            </div>
            <PrimaryButton
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
              className="mt-4 self-start"
            >
              Crear Necesidad
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
