"use client";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { useSocket } from "@/app/socketProvider";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { CustomTextarea } from "@/components/inputs/CustomInputs";
import { handlePostActivityNotificationError } from "@/components/notifications/postsActivity/actions";
import { emitPostActivityNotification } from "@/components/notifications/postsActivity/emitNotifications";
import { PostCommentForm, PostDataNotification } from "@/types/postTypes";
import { toastifySuccess } from "@/utils/functions/toastify";
import { getLocalTimeZone, today } from "@internationalized/date";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import { object, string } from "yup";

const commentSchema = object({
  comment: string()
    .required("Escriba un comentario")
    .min(1, "Escriba un comentario")
    .max(500, "Máximo 500 caracteres"),
});

const CommentForm = ({
  post,
  isReply,
  closeForm,
  userIdTo,
}: {
  post: PostDataNotification;
  isReply?: boolean;
  closeForm?: () => void;
  userIdTo: ObjectId;
}) => {
  const { socket } = useSocket();
  const router = useRouter();
  const initialValues: PostCommentForm = {
    comment: "",
  };

  const handleSubmit = (
    values: PostCommentForm,
    actions: FormikHelpers<PostCommentForm>
  ) => {
    emitPostActivityNotification(
      socket,
      userIdTo,
      post,
      null,
      {
        event: "notification_post_new_comment",
        payload: values
      }
    )
      .then(() => {
        router.refresh();
        toastifySuccess("Comentario enviado");
        actions.resetForm();
        if (closeForm) closeForm();
      })
      .catch((e) => handlePostActivityNotificationError(e))
      .finally(() => {
        actions.setSubmitting(false);
      });
  };
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={commentSchema}
    >
      {({ isSubmitting, errors }) => (
        <Form className="flex flex-col gap-2 items-start w-full">
          <Field
            as={CustomTextarea}
            name="comment"
            aria-label="Escribe tu comentario"
            placeholder="Escribe tu comentario"
            isRequired
            isInvalid={!!errors.comment}
            errorMessage={errors.comment}
          />
          <SecondaryButton
            type="submit"
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Enviar
          </SecondaryButton>
        </Form>
      )}
    </Formik>
  );
};

export default CommentForm;
