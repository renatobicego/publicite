import { Button } from "@nextui-org/react";
import FormCard from "../../FormCard";
import { Field, Form, Formik } from "formik";
import { CustomInput, CustomTextarea } from "@/app/components/inputs/CustomInputs";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";

const DescriptionForm = ({
  setIsFormVisible,
}: {
  setIsFormVisible: (value: boolean) => void;
}) => {
  const initialValues = {
    description: "Esta es la descripción del usuario Renato Bicego en la plataforma publicité",
  };
  const handleSubmit = () => {};
  return (
    <FormCard title="Actualizar Descripción">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        <Form className="flex flex-col gap-2">
          <Field
            as={CustomTextarea}
            name="description"
            label="Descripción"
            placeholder="Agregar descripción"
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
      </Formik>
    </FormCard>
  );
};

export default DescriptionForm;
