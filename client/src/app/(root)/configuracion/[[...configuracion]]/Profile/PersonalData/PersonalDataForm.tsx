import React from "react";
import FormCard from "../../FormCard";
import { Form, Formik, FormikHelpers } from "formik";
import { Button } from "@nextui-org/react";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { object, string } from "yup";

import FormInputs from "./FormInputs";
import { EditPersonProfileProps } from "@/types/userTypes";
import { editProfile } from "../actions";
import { useRouter } from "next/navigation";
import { toastifyError, toastifySuccess } from "@/app/utils/functions/toastify";

const personalDataFormSchema = object({
  birthDate: string()
    .required("La fecha de nacimiento es requerida")
    .min(6, "La fecha de nacimiento es requerida"),
  gender: string()
    .required("El genero es requerido")
    .min(1, "El género es requerido"),
  countryRegion: string()
    .required("La ubicación es requerida")
    .min(3, "La ubicación es requerida"),
});

const PersonalDataForm = ({
  setIsFormVisible,
  data
}: {
  setIsFormVisible: (value: boolean) => void;
  data?: EditPersonProfileProps
}) => {
  const initialValues: EditPersonProfileProps = {
    birthDate: data?.birthDate || "",
    gender: data?.gender || "",
    countryRegion: data?.countryRegion || "",
  };
  const router = useRouter();
  const handleSubmit = async (
    values: EditPersonProfileProps,
    actions: FormikHelpers<EditPersonProfileProps>
  ) => {
    const res = await editProfile(values, "Person");
    if (res?.message) {
      toastifySuccess(res.message);
      router.refresh();
      setIsFormVisible(false);
    }
    if (res?.error) toastifyError(res.error);
    actions.setSubmitting(false);

  };

  return (
    <FormCard title="Actualizar Datos" initialHeight={110}>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={personalDataFormSchema}
      >
        {({ errors, setFieldValue, initialValues, isSubmitting }) => (
          <Form className="flex flex-col gap-2">
            <FormInputs
              errors={errors}
              setFieldValue={setFieldValue}
              initialValues={initialValues}
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

export default PersonalDataForm;
