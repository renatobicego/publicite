import { BusinessSector, EditBusinessProfileProps } from "@/types/userTypes";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next-nprogress-bar";
import { editProfile } from "../Profile/actions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import FormCard from "../FormCard";
import { object, string } from "yup";
import { Button } from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import FormInputs from "./FormInputs";

const personalDataFormSchema = object({
  businessName: string()
    .required("El nombre de la empresa es requerido")
    .min(1, "El nombre de la empresa es requerido"),
  sector: string()
    .required("El rubro es requerido")
    .min(10, "El rubro es requerido"),
  countryRegion: string()
    .required("La ubicación es requerida")
    .min(3, "La ubicación es requerida"),
});

const BusinessDataForm = ({
  setIsFormVisible,
  data
}: {
  setIsFormVisible: (value: boolean) => void;
  data?: EditBusinessProfileProps;
}) => {
  const initialValues: EditBusinessProfileProps = {
    countryRegion: data?.countryRegion || "",
    businessName: data?.businessName || "",
    sector: (data?.sector as BusinessSector)._id || "",
  };
  const router = useRouter();
  const handleSubmit = async (
    values: EditBusinessProfileProps,
    actions: FormikHelpers<EditBusinessProfileProps>
  ) => {
    const res = await editProfile(values, "Business");
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

export default BusinessDataForm;
