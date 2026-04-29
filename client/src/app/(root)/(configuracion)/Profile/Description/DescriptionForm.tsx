import { Button } from "@nextui-org/react";
import FormCard from "../../FormCard";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { CustomInput, CustomSelect, CustomTextarea } from "@/components/inputs/CustomInputs";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { editProfile } from "../actions";
import { putContactData } from "@/services/userServices";
import { useRouter } from "next-nprogress-bar";
import { visibilityItems } from "@/utils/data/selectData";

interface DescriptionFormValues {
  description: string;
  descriptionVisibility: Visibility;
  profesion: string;
  profesionVisibility: Visibility;
}

const DescriptionForm = ({
  setIsFormVisible,
  description,
  descriptionVisibility,
  profesion,
  profesionVisibility,
  isBusiness = false,
  contactId,
}: {
  setIsFormVisible: (value: boolean) => void;
  description?: string;
  descriptionVisibility?: Visibility;
  profesion?: string;
  profesionVisibility?: Visibility;
  isBusiness?: boolean;
  contactId?: string;
}) => {
  const router = useRouter();

  const initialValues: DescriptionFormValues = {
    description: description || "",
    descriptionVisibility: descriptionVisibility || "contacts",
    profesion: profesion || "",
    profesionVisibility: profesionVisibility || "contacts",
  };

  const handleSubmit = async (
    values: DescriptionFormValues,
    actions: FormikHelpers<DescriptionFormValues>
  ) => {
    // Update top-level description via profile endpoint
    const profileRes = await editProfile(
      { description: values.description },
      isBusiness ? "Business" : "Person"
    );
    if (profileRes?.error) {
      toastifyError(profileRes.error);
      actions.setSubmitting(false);
      return;
    }

    // Update contact fields if contactId is available
    if (contactId) {
      const contactRes = await putContactData(contactId, {
        description: { text: values.description, visibility: values.descriptionVisibility },
        profesion: values.profesion
          ? { label: values.profesion, visibility: values.profesionVisibility }
          : undefined,
      } as any);
      if (contactRes?.error) {
        toastifyError(contactRes.error);
        actions.setSubmitting(false);
        return;
      }
    }

    toastifySuccess("Descripción actualizada");
    router.refresh();
    setIsFormVisible(false);
    actions.setSubmitting(false);
  };

  return (
    <FormCard title="Actualizar Descripción">
      <Formik initialValues={initialValues} onSubmit={handleSubmit} enableReinitialize>
        {({ isSubmitting, errors, values }) => (
          <Form className="flex flex-col gap-4">
            <div className="flex gap-3 items-end">
              <Field
                as={CustomTextarea}
                name="description"
                label="Descripción"
                aria-label="descripción"
                isInvalid={!!errors.description}
                errorMessage={errors.description}
                placeholder="Agregar descripción"
                className="flex-1"
              />
              <Field
                as={CustomSelect}
                name="descriptionVisibility"
                label="Visibilidad"
                aria-label="visibilidad descripción"
                items={visibilityItems}
                getItemValue={(item: any) => item.value}
                getItemTextValue={(item: any) => item.label}
                getItemLabel={(item: any) => item.label}
                placeholder="Visibilidad"
                className="max-w-[180px]"
              />
            </div>
            <div className="flex gap-3 items-end">
              <Field
                as={CustomInput}
                name="profesion"
                label="Profesión"
                aria-label="profesión"
                isInvalid={!!errors.profesion}
                errorMessage={(errors as any).profesion}
                placeholder="Ej: Diseñador Gráfico"
                className="flex-1"
              />
              <Field
                as={CustomSelect}
                name="profesionVisibility"
                label="Visibilidad"
                aria-label="visibilidad profesión"
                items={visibilityItems}
                getItemValue={(item: any) => item.value}
                getItemTextValue={(item: any) => item.label}
                getItemLabel={(item: any) => item.label}
                placeholder="Visibilidad"
                className="max-w-[180px]"
              />
            </div>
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
