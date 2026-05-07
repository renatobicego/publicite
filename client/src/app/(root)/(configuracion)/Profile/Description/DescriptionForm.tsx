import { Button, Checkbox } from "@nextui-org/react";
import FormCard from "../../FormCard";
import { Field, Form, Formik, FormikHelpers } from "formik";
import {
  CustomInput,
  CustomSelect,
  CustomTextarea,
} from "@/components/inputs/CustomInputs";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { putContactData } from "@/services/userServices";
import { Contact } from "@/types/userTypes";
import { useRouter } from "next-nprogress-bar";
import { visibilityItems } from "@/utils/data/selectData";

const PROFESION_OPTIONS = [
  { value: "Abogado/a", label: "Abogado/a" },
  { value: "Arquitecto/a", label: "Arquitecto/a" },
  { value: "Contador/a", label: "Contador/a" },
  {
    value: "Desarrollador/a de Software",
    label: "Desarrollador/a de Software",
  },
  { value: "Diseñador/a Gráfico/a", label: "Diseñador/a Gráfico/a" },
  { value: "Economista", label: "Economista" },
  { value: "Enfermero/a", label: "Enfermero/a" },
  { value: "Ingeniero/a Civil", label: "Ingeniero/a Civil" },
  { value: "Ingeniero/a Industrial", label: "Ingeniero/a Industrial" },
  {
    value: "Licenciado/a en Administración",
    label: "Licenciado/a en Administración",
  },
  {
    value: "Licenciado/a en Comunicación",
    label: "Licenciado/a en Comunicación",
  },
  { value: "Licenciado/a en Marketing", label: "Licenciado/a en Marketing" },
  { value: "Médico/a", label: "Médico/a" },
  { value: "Periodista", label: "Periodista" },
  { value: "Profesor/a", label: "Profesor/a" },
  { value: "Psicólogo/a", label: "Psicólogo/a" },
  { value: "Técnico/a en Sistemas", label: "Técnico/a en Sistemas" },
  { value: "Veterinario/a", label: "Veterinario/a" },
];

const KNOWN_VALUES = PROFESION_OPTIONS.map((o) => o.value);

/** Resolves the select key and custom text from a stored profesion string */
function resolveInitialProfesion(profesion?: string): {
  selectValue: string;
  customValue: string;
  isCustom: boolean;
} {
  if (!profesion) return { selectValue: "", customValue: "", isCustom: false };
  if (KNOWN_VALUES.includes(profesion))
    return { selectValue: profesion, customValue: "", isCustom: false };
  return { selectValue: "", customValue: profesion, isCustom: true };
}

interface DescriptionFormValues {
  description: string;
  descriptionVisibility: Visibility;
  profesionSelect: string;
  profesionCustom: string;
  profesionIsCustom: boolean;
  profesionVisibility: Visibility;
}

const DescriptionForm = ({
  setIsFormVisible,
  description,
  descriptionVisibility,
  profesion,
  profesionVisibility,
  contactId,
}: {
  setIsFormVisible: (value: boolean) => void;
  description?: string;
  descriptionVisibility?: Visibility;
  profesion?: string;
  profesionVisibility?: Visibility;
  contactId?: string;
}) => {
  const router = useRouter();

  const { selectValue, customValue, isCustom } = resolveInitialProfesion(profesion);

  const initialValues: DescriptionFormValues = {
    description: description || "",
    descriptionVisibility: descriptionVisibility || "contacts",
    profesionSelect: selectValue,
    profesionCustom: customValue,
    profesionIsCustom: isCustom,
    profesionVisibility: profesionVisibility || "contacts",
  };

  const handleSubmit = async (
    values: DescriptionFormValues,
    actions: FormikHelpers<DescriptionFormValues>,
  ) => {
    const resolvedProfesion =
      values.profesionIsCustom
        ? values.profesionCustom.trim()
        : values.profesionSelect;

    if (contactId) {
      const payload: Omit<Contact, "_id"> = {
        description: {
          text: values.description,
          visibility: values.descriptionVisibility,
        },
        ...(resolvedProfesion
          ? {
            profesion: {
              label: resolvedProfesion,
              visibility: values.profesionVisibility,
            },
          }
          : {}),
      };
      const contactRes = await putContactData(contactId, payload);
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
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, errors, values, setFieldValue }) => (
          <Form className="flex flex-col gap-4">
            <div className="flex items-end gap-3">
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
            <div className="flex items-end gap-3">
              <div className="flex flex-col flex-1 gap-2">
                {values.profesionIsCustom ? (
                  <Field
                    as={CustomInput}
                    name="profesionCustom"
                    label="Profesión"
                    aria-label="profesión personalizada"
                    placeholder="Escribir profesión"
                  />
                ) : (
                  <Field
                    as={CustomSelect}
                    name="profesionSelect"
                    label="Profesión"
                    aria-label="profesión"
                    items={PROFESION_OPTIONS}
                    getItemValue={(item: any) => item.value}
                    getItemTextValue={(item: any) => item.label}
                    getItemLabel={(item: any) => item.label}
                    placeholder="Seleccionar profesión"
                  />
                )}
                <Checkbox
                  isSelected={values.profesionIsCustom}
                  onValueChange={(checked) => {
                    setFieldValue("profesionIsCustom", checked);
                    setFieldValue("profesionSelect", "");
                    setFieldValue("profesionCustom", "");
                  }}
                  size="sm"
                >
                  Personalizar
                </Checkbox>
              </div>
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
