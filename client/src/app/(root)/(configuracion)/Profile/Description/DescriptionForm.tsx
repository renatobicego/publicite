import { Button } from "@nextui-org/react";
import FormCard from "../../FormCard";
import { Field, Form, Formik, FormikHelpers } from "formik";
import {
  CustomTextarea,
} from "@/components/inputs/CustomInputs";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { editProfile } from "../actions";
import { useRouter } from "next-nprogress-bar";

const DescriptionForm = ({
  setIsFormVisible,
  description,
  isBusiness = false,
}: {
  setIsFormVisible: (value: boolean) => void;
  description?: string;
  isBusiness?: boolean;
}) => {
  const router = useRouter();
  const initialValues = {
    description: description || "",
  };
  const handleSubmit = async (
    values: { description: string },
    actions: FormikHelpers<{ description: string }>
  ) => {
    const res = await editProfile(values, isBusiness ? "Business" : "Person");
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
        {({ isSubmitting, errors }) => (
          <Form className="flex flex-col gap-2">
            <Field
              as={CustomTextarea}
              name="description"
              label="Descripción"
              aria-label="descripción"
              isInvalid={!!errors.description}
              errorMessage={errors.description}
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
