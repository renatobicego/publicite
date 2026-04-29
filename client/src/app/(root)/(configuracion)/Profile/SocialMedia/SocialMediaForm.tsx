import React, { useEffect, useState } from "react";
import FormCard from "../../FormCard";
import { Form, Formik, FormikHelpers } from "formik";
import { Button } from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import FormInputs from "./FormInputs";
import { Contact } from "@/types/userTypes";
import { contactSchema } from "./socialMediaValidation";
import { putContactData } from "@/services/userServices";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import useUploadFiles from "@/utils/hooks/useUploadFiles";

const LOCAL_STORAGE_KEY = "socialMediaFormValues";

export interface SocialMediaFormValues extends Omit<Contact, "_id"> {
  curriculumFile?: File | null;
}

const SocialMediaForm = ({
  setIsFormVisible,
  contact,
}: {
  setIsFormVisible: (value: boolean) => void;
  contact?: Contact;
}) => {
  const { uploadCurriculum } = useUploadFiles([], []);

  const [initialValues, setInitialValues] = useState<SocialMediaFormValues>({
    phone: contact?.phone ?? "",
    phoneVisibility: contact?.phoneVisibility ?? "contacts",
    instagram: contact?.instagram ?? "",
    instagramVisibility: contact?.instagramVisibility ?? "contacts",
    facebook: contact?.facebook ?? "",
    facebookVisibility: contact?.facebookVisibility ?? "contacts",
    x: contact?.x ?? "",
    xVisibility: contact?.xVisibility ?? "contacts",
    website: contact?.website ?? "",
    websiteVisibility: contact?.websiteVisibility ?? "contacts",
    curriculum: contact?.curriculum ?? undefined,
    links: contact?.links ?? [],
    curriculumFile: null,
  });

  useEffect(() => {
    const storedValues = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedValues) {
      const parsedValues = JSON.parse(storedValues);
      setInitialValues((prev) => ({ ...prev, ...parsedValues, curriculumFile: null }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (
    values: SocialMediaFormValues,
    actions: FormikHelpers<SocialMediaFormValues>
  ) => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    let curriculumRef = values.curriculum?.ref;

    if (values.curriculumFile) {
      const uploaded = await uploadCurriculum(values.curriculumFile);
      if (!uploaded) {
        actions.setSubmitting(false);
        return;
      }
      curriculumRef = uploaded;
    }

    const { curriculumFile, ...contactData } = values;
    const payload: Omit<Contact, "_id"> = {
      ...contactData,
      curriculum: curriculumRef
        ? { ref: curriculumRef, visibility: values.curriculum?.visibility ?? "contacts" }
        : undefined,
    };

    const res = await putContactData(contact!._id, payload);
    if (res.error) {
      actions.setSubmitting(false);
      return toastifyError(res.error);
    }
    toastifySuccess(res.message as string);
    actions.setSubmitting(false);
    setIsFormVisible(false);
  };

  const handleCancel = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setIsFormVisible(false);
  };

  const handleChange = (event: any, values: SocialMediaFormValues) => {
    const { name, value } = event.target;
    const { curriculumFile, ...storableValues } = values;
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ ...storableValues, [name]: value })
    );
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
            <FormInputs errors={errors} setFieldValue={setFieldValue} values={values} />
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
