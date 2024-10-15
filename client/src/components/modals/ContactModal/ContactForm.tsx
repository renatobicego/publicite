import { createContactPetition } from "@/app/server/postActions";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { CustomInput, CustomTextarea } from "@/components/inputs/CustomInputs";
import { PetitionContact } from "@/types/postTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { SignedOut, useUser } from "@clerk/nextjs";
import { Button } from "@nextui-org/react";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { contactFormValidation } from "./validation";

const ContactForm = ({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) => {
  const { user } = useUser();
  const initialValues: PetitionContact = {
    userContacting: user?.publicMetadata?.mongoId,
    email: user?.emailAddresses[0].emailAddress || "",
    post: postId,
    fullName: user?.fullName || "",
    phone: undefined,
    message: "",
  };
  const handleSubmit = async(
    values: PetitionContact,
    actions: FormikHelpers<PetitionContact>
  ) => {
    const resApi = await createContactPetition(values);
    if (resApi.error) {
      toastifyError(resApi.error);
      actions.setSubmitting(false);
      return;
    }
    toastifySuccess(resApi.message as string);
  };
  return (
    <Formik
      validateOnBlur={false}
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={contactFormValidation}
    >
      {({ isSubmitting, errors }) => {
        return (
          <Form className="flex flex-col w-full self-center gap-4">
            <SignedOut>
              <Field
                as={CustomInput}
                name="fullName"
                label="Nombre Completo"
                placeholder="Agregue su nombre completo"
                isRequired
                aria-label="nombre completo"
                isInvalid={!!errors.fullName}
                errorMessage={errors.fullName}
              />
              <Field
                as={CustomInput}
                name="email"
                label="Email"
                type="email"
                placeholder="Agregue su correo"
                isRequired
                aria-label="correo electrónico"
                isInvalid={!!errors.email}
                errorMessage={errors.email}
              />
              <Field
                as={CustomInput}
                name="phone"
                label="Whatsapp / Teléfono"
                isInvalid={!!errors.phone}
                errorMessage={errors.phone}
                aria-label="contacto"
                placeholder="Ingrese teléfono de contacto"
              />
            </SignedOut>
            <Field
              as={CustomTextarea}
              name="message"
              label="Mensaje"
              placeholder="Agregue su mensaje"
              description="Máximo 300 caracteres"
              isRequired
              aria-label="mensaje"
              isInvalid={!!errors.message}
              errorMessage={errors.message}
            />
            <RequiredFieldsMsg />
            <div className="flex gap-2 items-center justify-end">
              <Button
                color="primary"
                variant="light"
                radius="full"
                onPress={onClose}
              >
                Cerrar
              </Button>
              <PrimaryButton
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
                type="submit"
                className="self-start"
              >
                {isSubmitting ? "Enviando" : "Enviar Solicitud"}
              </PrimaryButton>
            </div>
            {Object.keys(errors).length > 0 && (
              <p className="text-danger text-sm">
                Por favor corrija los errores
              </p>
            )}
          </Form>
        );
      }}
    </Formik>
  );
};

export default ContactForm;
