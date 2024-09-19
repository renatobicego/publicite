import { Button } from "@nextui-org/react";
import FormCard from "../../FormCard";
import { Field, Form, Formik, FormikHelpers } from "formik";
import {
  CustomInput,
  CustomTextarea,
} from "@/app/components/inputs/CustomInputs";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/app/utils/functions/toastify";
import { editProfile } from "../actions";
import { useRouter } from "next/navigation";

const DescriptionForm = ({
  setIsFormVisible,
  description,
}: {
  setIsFormVisible: (value: boolean) => void;
  description?: string;
}) => {
  const router = useRouter();
  const initialValues = {
    description: description || "",
  };
  const handleSubmit = async (
    values: { description: string },
    actions: FormikHelpers<{ description: string }>
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
    <FormCard title="Actualizar Descripción">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
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

export default DescriptionForm;
