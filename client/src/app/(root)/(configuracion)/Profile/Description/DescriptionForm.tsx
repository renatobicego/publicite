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
  // Salud
  { value: "Médico/a", label: "Médico/a" },
  { value: "Odontólogo/a", label: "Odontólogo/a" },
  { value: "Enfermero/a", label: "Enfermero/a" },
  { value: "Farmacéutico/a", label: "Farmacéutico/a" },
  { value: "Kinesiólogo/a", label: "Kinesiólogo/a" },
  { value: "Nutricionista", label: "Nutricionista" },
  { value: "Psicólogo/a", label: "Psicólogo/a" },
  { value: "Psiquiatra", label: "Psiquiatra" },
  { value: "Veterinario/a", label: "Veterinario/a" },
  { value: "Bioquímico/a", label: "Bioquímico/a" },
  { value: "Radiólogo/a", label: "Radiólogo/a" },
  // Derecho y Finanzas
  { value: "Abogado/a", label: "Abogado/a" },
  { value: "Escribano/a", label: "Escribano/a" },
  { value: "Juez/a", label: "Juez/a" },
  { value: "Fiscal", label: "Fiscal" },
  { value: "Contador/a", label: "Contador/a" },
  { value: "Economista", label: "Economista" },
  { value: "Actuario/a", label: "Actuario/a" },
  { value: "Asesor/a Financiero/a", label: "Asesor/a Financiero/a" },
  { value: "Auditor/a", label: "Auditor/a" },
  { value: "Analista Financiero/a", label: "Analista Financiero/a" },
  // Ingeniería y Tecnología
  { value: "Ingeniero/a Civil", label: "Ingeniero/a Civil" },
  { value: "Ingeniero/a Industrial", label: "Ingeniero/a Industrial" },
  { value: "Ingeniero/a Electrónico/a", label: "Ingeniero/a Electrónico/a" },
  { value: "Ingeniero/a Mecánico/a", label: "Ingeniero/a Mecánico/a" },
  { value: "Ingeniero/a Químico/a", label: "Ingeniero/a Químico/a" },
  { value: "Ingeniero/a Agrónomo/a", label: "Ingeniero/a Agrónomo/a" },
  { value: "Ingeniero/a en Sistemas", label: "Ingeniero/a en Sistemas" },
  {
    value: "Desarrollador/a de Software",
    label: "Desarrollador/a de Software",
  },
  { value: "Técnico/a Electricista", label: "Técnico/a Electricista" },
  { value: "Técnico/a Mecánico/a", label: "Técnico/a Mecánico/a" },
  { value: "Analista de Datos", label: "Analista de Datos" },
  { value: "Científico/a de Datos", label: "Científico/a de Datos" },
  { value: "Administrador/a de Redes", label: "Administrador/a de Redes" },
  {
    value: "Especialista en Ciberseguridad",
    label: "Especialista en Ciberseguridad",
  },
  // Arquitectura y Construcción
  { value: "Arquitecto/a", label: "Arquitecto/a" },
  { value: "Diseñador/a de Interiores", label: "Diseñador/a de Interiores" },
  { value: "Maestro/a Mayor de Obras", label: "Maestro/a Mayor de Obras" },
  { value: "Albañil", label: "Albañil" },
  { value: "Plomero/a", label: "Plomero/a" },
  { value: "Carpintero/a", label: "Carpintero/a" },
  { value: "Herrero/a", label: "Herrero/a" },
  { value: "Pintor/a", label: "Pintor/a" },
  // Educación
  { value: "Profesor/a", label: "Profesor/a" },
  { value: "Docente Universitario/a", label: "Docente Universitario/a" },
  { value: "Psicopedagogo/a", label: "Psicopedagogo/a" },
  // Comunicación, Marketing y Diseño
  {
    value: "Licenciado/a en Comunicación",
    label: "Licenciado/a en Comunicación",
  },
  { value: "Licenciado/a en Marketing", label: "Licenciado/a en Marketing" },
  { value: "Periodista", label: "Periodista" },
  { value: "Relacionista Público/a", label: "Relacionista Público/a" },
  { value: "Community Manager", label: "Community Manager" },
  { value: "Diseñador/a Gráfico/a", label: "Diseñador/a Gráfico/a" },
  { value: "Diseñador/a Web", label: "Diseñador/a Web" },
  { value: "Fotógrafo/a", label: "Fotógrafo/a" },
  { value: "Editor/a de Video", label: "Editor/a de Video" },
  { value: "Ilustrador/a", label: "Ilustrador/a" },
  { value: "Animador/a Digital", label: "Animador/a Digital" },
  { value: "Traductor/a", label: "Traductor/a" },
  // Administración y Gestión
  {
    value: "Licenciado/a en Administración",
    label: "Licenciado/a en Administración",
  },
  { value: "Gerente", label: "Gerente" },
  { value: "Director/a", label: "Director/a" },
  { value: "Consultor/a de Empresas", label: "Consultor/a de Empresas" },
  { value: "Recursos Humanos", label: "Recursos Humanos" },
  { value: "Asistente Administrativo/a", label: "Asistente Administrativo/a" },
  { value: "Secretario/a", label: "Secretario/a" },
  { value: "Recepcionista", label: "Recepcionista" },
  // Comercio y Ventas
  { value: "Vendedor/a", label: "Vendedor/a" },
  { value: "Representante Comercial", label: "Representante Comercial" },
  { value: "Agente Inmobiliario/a", label: "Agente Inmobiliario/a" },
  { value: "Corredor/a de Seguros", label: "Corredor/a de Seguros" },
  {
    value: "Importador/a / Exportador/a",
    label: "Importador/a / Exportador/a",
  },
  // Gastronomía y Turismo
  { value: "Chef / Cocinero/a", label: "Chef / Cocinero/a" },
  { value: "Pastelero/a / Repostero/a", label: "Pastelero/a / Repostero/a" },
  { value: "Bartender", label: "Bartender" },
  { value: "Mozo/a / Camarero/a", label: "Mozo/a / Camarero/a" },
  { value: "Guía de Turismo", label: "Guía de Turismo" },
  { value: "Hotelero/a", label: "Hotelero/a" },
  // Arte, Cultura y Deporte
  { value: "Músico/a", label: "Músico/a" },
  { value: "Actor / Actriz", label: "Actor / Actriz" },
  { value: "Bailarín/a", label: "Bailarín/a" },
  { value: "Escritor/a", label: "Escritor/a" },
  { value: "Artista Plástico/a", label: "Artista Plástico/a" },
  { value: "Entrenador/a Personal", label: "Entrenador/a Personal" },
  { value: "Deportista Profesional", label: "Deportista Profesional" },
  { value: "Árbitro/a", label: "Árbitro/a" },
  // Agro y Medio Ambiente
  { value: "Agrónomo/a", label: "Agrónomo/a" },
  { value: "Productor/a Agropecuario/a", label: "Productor/a Agropecuario/a" },
  { value: "Biólogo/a", label: "Biólogo/a" },
  { value: "Geólogo/a", label: "Geólogo/a" },
  {
    value: "Especialista en Medio Ambiente",
    label: "Especialista en Medio Ambiente",
  },
  // Transporte y Seguridad
  { value: "Chofer / Conductor/a", label: "Chofer / Conductor/a" },
  { value: "Piloto", label: "Piloto" },
  { value: "Mecánico/a Automotriz", label: "Mecánico/a Automotriz" },
  { value: "Policía", label: "Policía" },
  { value: "Bombero/a", label: "Bombero/a" },
  { value: "Militar", label: "Militar" },
  { value: "Guardia de Seguridad", label: "Guardia de Seguridad" },
  // Otros
  { value: "Emprendedor/a", label: "Emprendedor/a" },
  { value: "Freelancer", label: "Freelancer" },
  { value: "Estudiante", label: "Estudiante" },
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

  const { selectValue, customValue, isCustom } =
    resolveInitialProfesion(profesion);

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
    const resolvedProfesion = values.profesionIsCustom
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
      console.log(payload);
      const contactRes = await putContactData(contactId, payload);
      if (contactRes?.error) {
        toastifyError(contactRes.error);
        actions.setSubmitting(false);
        return;
      }
    }
    console.log(initialValues);

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
            <div className="flex items-start gap-3">
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
            <div className="flex items-start gap-3">
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
