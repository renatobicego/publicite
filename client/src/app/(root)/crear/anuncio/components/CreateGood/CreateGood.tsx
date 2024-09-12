import { GoodPostValues } from "@/types/postTypes";
import { Form, Formik, FormikHelpers } from "formik";
import { goodValidation } from "./goodValidation";
import TitleDescription from "../CreateForm/inputs/TitleDescription";
import PriceCategory from "../CreateForm/inputs/PriceCategory";
import { Divider } from "@nextui-org/react";
import Condition from "./Condition";
import dynamic from "next/dynamic";
import PlacePicker from "../CreateForm/inputs/PlacePicker";
import LatLngAutocomplete from "@/app/components/inputs/LatLngAutocomplete";

const CreateGood = ({ files }: { files: File[] }) => {
  const initialValues: GoodPostValues = {
    attachedFiles: [],
    description: "",
    title: "",
    price: undefined,
    category: "",
    author: "",
    condition: undefined,
    imagesUrls: [],
    location: {
      latitude: undefined,
      longitude: undefined,
    },
    postType: "Good",
    visibility: "Public",
    brand: undefined,
    model: undefined,
    year: undefined,
  };

  const handleSubmit = async (
    values: GoodPostValues,
    actions: FormikHelpers<GoodPostValues>
  ) => {
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
      {({ isSubmitting, errors }) => (
        <Form className="flex flex-col gap-4">
          <TitleDescription errors={errors} />
          <PriceCategory errors={errors} isService={true} />
          <Condition errors={errors} />
          <Divider />

          <PlacePicker/>
        </Form>
      )}
    </Formik>
  );
};

export default CreateGood;
