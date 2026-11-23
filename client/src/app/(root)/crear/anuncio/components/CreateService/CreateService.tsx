import {
  GoodPostValues,
  PostBehaviourType,
  ServicePostValues,
} from "@/types/postTypes";
import { Field, Form, Formik, FormikHelpers } from "formik";
import TitleDescription from "../CreateForm/inputs/TitleDescription";
import PriceCategory from "../CreateForm/inputs/PriceCategory";
import { Divider } from "@nextui-org/react";
import PlacePicker from "../CreateForm/inputs/PlacePicker";
import AccordionInputs from "../CreateForm/inputs/AccordionInputs/AccordionInputs";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { serviceValidation } from "./serviceValidation";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import useUploadFiles from "@/utils/hooks/useUploadFiles";
import { createPost } from "../../../../../server/postActions";
import { POSTS } from "@/utils/data/urls";
import { useRouter } from "@bprogress/next/app";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { useAttachedFiles } from "../CreateForm/inputs/AccordionInputs/AttachedFIles/AttachedFilesContext";
import { deleteFilesService } from "@/app/server/uploadThing";
import { CustomDateInput } from "@/components/inputs/CustomInputs";
import AdSpaceInputs from "../CreateAdSpace/AdSpaceInputs";
import { adSpaceValidation } from "../CreateAdSpace/adSpaceValidation";
import { adSpacePayload, emptyAdSpace } from "@/utils/data/adSpaces";
import { AdSpacePostValues } from "@/types/postTypes";

const CreateService = ({
  files,
  userCanPublishPost,
  userId,
  postBehaviourType,
  isAdSpace = false,
}: {
  files: File[];
  userCanPublishPost: boolean;
  userId?: string;
  postBehaviourType: PostBehaviourType;
  /** Espacio publicitario (sólo Empresa / Agente): siempre geolocalizado. */
  isAdSpace?: boolean;
}) => {
  const initialValues: ServicePostValues | AdSpacePostValues = {
    attachedFiles: [],
    description: "",
    title: "",
    price: undefined,
    frequencyPrice: undefined,
    category: "",
    author: userId || "",
    imagesUrls: [],
    geoLocation: {
      lat: undefined,
      lng: undefined,
      description: "",
      userSetted: false,
      ratio: 5,
    },
    postType: isAdSpace ? "adspace" : "service",
    visibility: {
      post: postBehaviourType === "agenda" && !isAdSpace ? "contacts" : "public",
      socialMedia: "public",
    },
    ...(isAdSpace && {
      adSpace: { ...emptyAdSpace("radio"), medium: undefined as any },
    }),
    createAt: today(getLocalTimeZone()).toString(),
    postBehaviourType,
    endDate: today(getLocalTimeZone()).add({ days: 14 }).toString(),
  };

  const { attachedFiles } = useAttachedFiles();

  const { progress, submitFiles, discardUploaded } = useUploadFiles(
    files,
    attachedFiles
  );
  const router = useRouter();

  const handleSubmit = async (
    values: GoodPostValues,
    actions: FormikHelpers<GoodPostValues>
  ) => {
    if (!userCanPublishPost) {
      actions.setSubmitting(false);
      return;
    }
    if (
      values.endDate < today(getLocalTimeZone()).toString() ||
      values.endDate > today(getLocalTimeZone()).add({ years: 10 }).toString()
    ) {
      actions.setFieldError(
        "endDate",
        "La fecha de finalización debe ser posterior a la fecha actual y no más de 1 año"
      );
      actions.setSubmitting(false);
      return;
    }
    const newValuesWithUrlFiles = await submitFiles(values, actions);
    if (!newValuesWithUrlFiles) {
      actions.setSubmitting(false);
      return;
    }
    values = newValuesWithUrlFiles;

    const dbLocation = {
      location: {
        type: "Point",
        coordinates: [values.geoLocation.lng, values.geoLocation.lat],
      },
      description: values.geoLocation.description,
      userSetted: values.geoLocation.userSetted,
      ratio: values.geoLocation.ratio
        ? values.geoLocation.ratio * 1000
        : 5 * 1000,
      // Radio, zona o todo el mundo (ver utils/data/geoReach.ts).
      scope: values.geoLocation.scope ?? "radius",
      zoneLevel:
        values.geoLocation.scope === "zone"
          ? values.geoLocation.zoneLevel ?? null
          : null,
      areas: values.geoLocation.areas ?? null,
    };

    const attachedFiles = values.attachedFiles.map((file) => ({
      url: file.url,
      label: file.label,
    }));

    const resApi = await createPost(
      {
        ...values,
        geoLocation: dbLocation,
        attachedFiles,
        category: [values.category],
        ...(isAdSpace && {
          adSpace: adSpacePayload((values as unknown as AdSpacePostValues).adSpace),
        }),
      },
      userCanPublishPost
    );
    if (resApi.error) {
      // El server lo rechazó (ej. sin espacio): no dejar archivos huérfanos.
      await discardUploaded();
      toastifyError(resApi.error);
      deleteFilesService(values.attachedFiles.map((file) => file.url));
      deleteFilesService(values.imagesUrls.map((file) => file));
      return;
    }
    actions.resetForm();
    toastifySuccess("Anuncio creado exitosamente");
    router.push(`${POSTS}/${resApi.id}`);
  };
  return (
    <Formik
      validateOnBlur={false}
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
      validationSchema={isAdSpace ? adSpaceValidation : serviceValidation}
    >
      {({ isSubmitting, errors, setFieldValue, values }) => {
        return (
          <Form className="flex flex-col gap-4">
            {isAdSpace && (
              <>
                <p className="text-sm rounded-lg bg-warning-50 px-3 py-2">
                  Publicás tu espacio para que las marcas te contacten.
                  Soonpublicité genera el contacto, no realiza ventas: el precio
                  es de referencia y la contratación la arreglás vos.
                </p>
                <AdSpaceInputs />
                <Divider />
              </>
            )}
            <TitleDescription errors={errors} setFieldValue={setFieldValue} />
            <PriceCategory errors={errors} isService={true} />
            <Field
              as={CustomDateInput}
              name="endDate"
              errorMessage={errors.endDate}
              isInvalid={!!errors.endDate}
              label="Fecha de Vencimiento"
              aria-label="fecha de vencimiento"
              description="La fecha de vencimiento es la fecha en la que el anuncio se considera vencido. Luego podrá cambiarla o renovarla."
              onChange={(value: CalendarDate) =>
                setFieldValue("endDate", value ? value.toString() : "")
              }
              minValue={today(getLocalTimeZone())}
              maxValue={today(getLocalTimeZone()).add({ years: 10 })}
            />
            <Divider />
            <h6>
              {isAdSpace
                ? "¿Desde dónde se publica? El espacio se ve para quien esté dentro del radio que elijas."
                : "Busque su ubicación o seleccionela en el mapa"}
            </h6>
            <PlacePicker
              location={values.geoLocation}
              setFieldValue={setFieldValue}
              error={errors.geoLocation}
            />
            <AccordionInputs
              errors={errors}
              isService={true}
              postBehaviourType={postBehaviourType}
            />
            <RequiredFieldsMsg />
            <PrimaryButton
              isDisabled={isSubmitting || !userCanPublishPost}
              isLoading={isSubmitting}
              type="submit"
              className="mt-4"
            >
              {isSubmitting
                ? `Publicando ${progress}%`
                : isAdSpace
                  ? "Publicar espacio publicitario"
                  : "Crear Anuncio"}
            </PrimaryButton>
            {Object.keys(errors).length > 0 && (
              <p className="text-danger text-sm">
                {errors.imagesUrls
                  ? errors.imagesUrls
                  : "Por favor corrija los errores"}
              </p>
            )}
          </Form>
        );
      }}
    </Formik>
  );
};

export default CreateService;
