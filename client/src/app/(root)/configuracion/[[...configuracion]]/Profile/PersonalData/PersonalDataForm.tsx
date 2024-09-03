import React from "react";
import FormCard from "../../FormCard";
import { Form, Formik } from "formik";
import { Button } from "@nextui-org/react";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { object, string } from "yup";

import FormInputs from "./FormInputs";

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

export interface PersonalDataValues {
  birthDate: string;
  gender: string;
  countryRegion: string;
}

const PersonalDataForm = ({
  setIsFormVisible,
}: {
  setIsFormVisible: (value: boolean) => void;
}) => {
  const initialValues = {
    birthDate: "2000-01-01",
    gender: "M",
    countryRegion: "Las Heras, Mendoza, Argentina",
  };
  const handleSubmit = () => {};

  return (
    <FormCard title="Actualizar Datos" initialHeight={110}>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={personalDataFormSchema}
      >
        {({ errors, setFieldValue, initialValues }) => (
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
              <PrimaryButton type="submit">Actualizar</PrimaryButton>
            </div>
          </Form>
        )}
      </Formik>
    </FormCard>
  );
};

export default PersonalDataForm;
