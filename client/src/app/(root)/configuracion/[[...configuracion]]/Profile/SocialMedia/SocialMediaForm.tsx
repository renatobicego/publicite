import React, { useEffect, useState } from "react";
import FormCard from "../../FormCard";
import { Form, Formik } from "formik";
import { Button } from "@nextui-org/react";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import FormInputs from "./FormInputs";
import { Contact } from "@/types/userTypes";
import { contactSchema } from "./socialMediaValidation";

const LOCAL_STORAGE_KEY = "socialMediaFormValues";

const SocialMediaForm = ({
  setIsFormVisible,
  contact,
}: {
  setIsFormVisible: (value: boolean) => void;
  contact?: Contact;
}) => {
  const [initialValues, setInitialValues] = useState<Contact>({
    phone: contact?.phone ?? "",
    instagram: contact?.instagram ?? "",
    facebook: contact?.facebook ?? "",
    x: contact?.x ?? "",
    website: contact?.website ?? "",
    _id: contact?._id ?? "",
  });

  // Check localStorage when the component mounts
  useEffect(() => {
    const storedValues = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedValues) {
      // Set initial values from localStorage
      const parsedValues = JSON.parse(storedValues);
      Object.keys(parsedValues).forEach((key) => {
        const keyValue = key as keyof Contact;
        setInitialValues((prev) => ({
          ...prev,
          [keyValue]: parsedValues[key],
        }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (values: Contact) => {
    // Clear localStorage on submit
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    console.log("Form submitted with values:", values);
  };

  const handleCancel = () => {
    // Clear localStorage on cancel
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setIsFormVisible(false);
  };

  const handleChange = (
    event: any,
    values: Contact
  ) => {
    const { name, value } = event.target;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({...values, [name]: value}));
  };

  return (
    <FormCard title="Actualizar Datos" initialHeight={110}>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={contactSchema}
        enableReinitialize
      >
        {({ errors, setFieldValue, isSubmitting, values }) => (
          <Form
            onChange={(e) => handleChange(e, values)}
            className="flex flex-col gap-2"
          >
            <FormInputs errors={errors} setFieldValue={setFieldValue} />
            <div className="flex gap-2">
              <Button
                color="default"
                variant="light"
                radius="full"
                onPress={handleCancel}
              >
                Cancelar
              </Button>
              <PrimaryButton
                type="submit"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Actualizar
              </PrimaryButton>
            </div>
          </Form>
        )}
      </Formik>
    </FormCard>
  );
};

export default SocialMediaForm;
