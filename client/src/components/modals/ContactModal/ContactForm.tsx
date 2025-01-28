import PrimaryButton from "@/components/buttons/PrimaryButton";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { CustomInput, CustomTextarea } from "@/components/inputs/CustomInputs";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { SignedOut, useUser } from "@clerk/nextjs";
import { Button } from "@nextui-org/react";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { contactFormValidation } from "./validation";
import { PetitionContactSeller } from "@/types/postTypes";
import { useSocket } from "@/app/socketProvider";
import { emitContactSellerNotification } from "@/components/notifications/contactSeller/emitNotifications";

const ContactForm = ({
  postId,
  onClose,
  authorId,
}: {
  postId: string;
  onClose: () => void;
  authorId: ObjectId;
}) => {
  const { user } = useUser();
  const { socket } = useSocket();
  const initialValues: PetitionContactSeller = {
    _id: user?.publicMetadata?.mongoId,
    email: user?.emailAddresses[0].emailAddress || "",
    post: postId,
    name: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: undefined,
    message: "",
  };
  const handleSubmit = async (
    values: PetitionContactSeller,
    actions: FormikHelpers<PetitionContactSeller>
  ) => {
    actions.setSubmitting(true);

    emitContactSellerNotification(
      socket,
      postId,
      authorId,
      values,
      user
        ? {
            _id: user.publicMetadata?.mongoId,
            username: user.username ? user.username : "",
          }
        : null
    )
      .then(() => {
        toastifySuccess("Se ha enviado la solicitud correctamente");
        onClose();
      })
      .catch(() => toastifyError("Error al enviar la solicitud"))
      .finally(() => {
        actions.setSubmitting(false);
      });
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
                name="name"
                label="Nombre"
                placeholder="Agregue su nombre"
                isRequired
                aria-label="nombre"
                isInvalid={!!errors.name}
                errorMessage={errors.name}
              />
              <Field
                as={CustomInput}
                name="lastName"
                label="Apellido"
                placeholder="Agregue su apellido"
                isRequired
                aria-label="apellido"
                isInvalid={!!errors.lastName}
                errorMessage={errors.lastName}
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
