import PrimaryButton from "@/components/buttons/PrimaryButton";
import { CustomTextarea } from "@/components/inputs/CustomInputs";
import { PostCalificationData, PostReview } from "@/types/postTypes";
import { Button } from "@nextui-org/react";
import { Form, Formik, Field, FormikHelpers } from "formik";
import { useRouter } from "next-nprogress-bar";
import StarRating from "./StarRating";
import { useUserData } from "@/app/(root)/providers/userDataProvider";
import { emitPostCalificationNotification } from "@/components/notifications/postsCalification/emitNotifications";
import { useState } from "react";
import { useSocket } from "@/app/socketProvider";
import { toastifySuccess } from "@/utils/functions/toastify";
import { handlePostCalificationNotificationError } from "@/components/notifications/postsCalification/actions";

export interface PostReviewValues
  extends Omit<PostReview, "_id" | "date" | "author"> {
  author: string;
}

const ReviewPostForm = ({
  post,
  onClose,
  notificationId,
  contactSellerId,
}: {
  post: PostCalificationData;
  onClose: () => void;
  notificationId: string;
  contactSellerId: string;
}) => {
  const { userIdLogged } = useUserData();
  const { socket } = useSocket();

  const initialValues: PostReviewValues = {
    author: userIdLogged || "",
    rating: 0,
    review: "",
  };

  const handleSubmit = (
    values: PostReviewValues,
    actions: FormikHelpers<PostReviewValues>
  ) => {
    if (values.review.length < 5) {
      actions.setFieldError(
        "review",
        "La opinión debe tener al menos 5 caracteres"
      );
      actions.setSubmitting(false);
      return;
    }
    emitPostCalificationNotification(
      socket,
      userIdLogged as string,
      post.author,
      {
        event: "notification_new_calification_response",
        payload: {
          contactSeller_id: contactSellerId,
          post,
          postCalificationType: "response",
          review: values,
        },
      },
      notificationId
    )
      .then(() => {
        onClose();
        actions.resetForm();
        toastifySuccess("Se ha enviado la opinión correctamente");
      })
      .catch(handlePostCalificationNotificationError)
      .finally(() => {
        actions.setSubmitting(false);
      });
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue, isSubmitting, errors }) => (
        <Form className="flex flex-col gap-4 justify-between flex-1">
          <StarRating
            value={values.rating}
            onChange={(value) => setFieldValue("rating", value)}
          />
          <Field
            as={CustomTextarea}
            name="review"
            label="Opinión"
            className="flex-1 grow max-md:min-h-[200px]"
            classNames={{
              label: "select-none",
              inputWrapper: "grow items-start",
            }}
            isInvalid={!!errors.review}
            errorMessage={errors.review}
            placeholder="Escribe tu opinión"
          />

          <div className="flex items-center gap-2 ">
            <Button
              onPress={onClose}
              color="danger"
              variant="light"
              radius="full"
            >
              Cancelar
            </Button>
            <PrimaryButton
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
            >
              {isSubmitting ? `Enviando` : "Enviar Opinión"}
            </PrimaryButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ReviewPostForm;
