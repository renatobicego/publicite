"use client";
import SecondaryButton from "@/app/components/buttons/SecondaryButton";
import { CustomTextarea } from "@/app/components/inputs/CustomInputs";
import { PostCommentForm } from "@/types/postTypes";
import { useUser } from "@clerk/nextjs";
import { getLocalTimeZone, today } from "@internationalized/date";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { comment } from "postcss";
import { object, string } from "yup";

const commentSchema = object({
  comment: string()
    .required("Escriba un comentario")
    .min(1, "Escriba un comentario")
    .max(500, "Máximo 500 caracteres"),
});

const CommentForm = ({
  postId,
  isReply,
  closeForm,
}: {
  postId: ObjectId;
  isReply?: boolean;
  closeForm?: () => void;
}) => {
  const { user } = useUser();

  const initialValues: PostCommentForm = {
    author: user?.id as ObjectId,
    comment: "",
    date: today(getLocalTimeZone()).toString(),
  };

  const handleSubmit = (
    values: PostCommentForm,
    actions: FormikHelpers<PostCommentForm>
  ) => {
    console.log(values);
    actions.resetForm();
    actions.setSubmitting(false);
    if (closeForm) closeForm();
    return;
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
