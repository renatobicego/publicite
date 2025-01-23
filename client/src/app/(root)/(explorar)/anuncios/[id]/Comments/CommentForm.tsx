"use client";
import { useSocket } from "@/app/socketProvider";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { CustomTextarea } from "@/components/inputs/CustomInputs";
import { handlePostActivityNotificationError } from "@/components/notifications/postsActivity/actions";
import { emitPostActivityNotification } from "@/components/notifications/postsActivity/emitNotifications";
import {
  PostComment,
  PostCommentForm,
  PostDataNotification,
} from "@/types/postTypes";
import { toastifySuccess } from "@/utils/functions/toastify";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { object, string } from "yup";

const commentSchema = object({
  comment: string()
    .required("Escriba un comentario")
    .min(1, "Escriba un comentario")
    .max(500, "Máximo 500 caracteres"),
});

const CommentForm = ({
  post,
  commentToReplyId,
  closeForm,
  userIdTo,
  setComments,
}: {
  post: PostDataNotification & { author: string };
  commentToReplyId?: string;
  closeForm?: () => void;
  userIdTo: ObjectId;
  setComments: Dispatch<SetStateAction<PostComment[]>>;
}) => {
  const { socket } = useSocket();
  const initialValues: PostCommentForm = {
    comment: "",
  };

  const handleSubmit = (
    values: PostCommentForm,
    actions: FormikHelpers<PostCommentForm>
  ) => {
    // send comment to server
    emitPostActivityNotification<{
      body: PostComment;
    }>(
      socket,
      userIdTo,
      post,
      null,
      commentToReplyId // if its a reply
        ? {
            event: "notification_post_new_comment_response",
            payload: {
              author: post.author,
              commentId: commentToReplyId,
              response: values.comment,
            },
          }
        : {
            event: "notification_post_new_comment",
            payload: values,
          }
    )
      .then((res) => {
        const {
          body: { body },
        } = res; // get comment data
        if (commentToReplyId) { // if its a reply, update comment
          setComments((prev) =>
            prev.map((comment) => {
              if (comment._id === commentToReplyId) {
                return {
                  ...comment,
                  responses: body,
                };
              }
              return comment;
            })
          );
        } else { // if its not a reply, add comment
          setComments((prev) => [...prev, body]);
        }
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
