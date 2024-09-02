import React from "react";
import FormCard from "../../FormCard";
import { Form, Formik } from "formik";
import { Button } from "@nextui-org/react";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { object, string } from "yup";
import FormInputs from "./FormInputs";
import { Contact } from "@/types/userTypes";

const socialMediaFormSchema = object({
  phone: string()
    .notRequired()
    .test("last_name", "Last Name test message", function (value) {
      if (!!value) {
        const schema = string().min(2);
        return schema.isValidSync(value);
      }
      return true;
    }),
});

const SocialMediaForm = ({
  setIsFormVisible,
}: {
  setIsFormVisible: (value: boolean) => void;
}) => {
  const initialValues: Contact = {
    _id: "",
    phone: "",
    instagram: "",
    facebook: "",
    twitter: "",
    website: "",
  };
  const handleSubmit = () => {};

  return (
    <FormCard title="Actualizar Datos" initialHeight={110}>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={socialMediaFormSchema}
      >
        {({ errors, setFieldValue, initialValues }) => (
          <Form className="flex flex-col gap-2">
            <FormInputs
              errors={errors}
              setFieldValue={setFieldValue}
            />
            <div className="flex gap-2">
              <Button
                color="default"
                variant="light"
                radius="full"
                onPress={() => setIsFormVisible(false)}
              >
                Cancelar
              </Button>
              <PrimaryButton type="submit">Actualizar</PrimaryButton>
            </div>
          </Form>
        )}
      </Formik>
    </FormCard>
  );
};

export default SocialMediaForm;
