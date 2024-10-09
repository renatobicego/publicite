import PrimaryButton from "@/components/buttons/PrimaryButton";
import { CustomTextarea } from "@/components/inputs/CustomInputs";
import { PostReview } from "@/types/postTypes";
import { useUser } from "@clerk/nextjs";
import { Button } from "@nextui-org/react";
import { Form, Formik, Field } from "formik";
import { useRouter } from "next-nprogress-bar";
import StarRating from "./StarRating";

export interface PostReviewValues extends Omit<PostReview, "_id"> {}

const ReviewPostForm = ({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) => {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    router.replace("/iniciar-sesion");
    return null;
  }

  const initialValues: PostReviewValues = {
    author: user.publicMetadata.mongoId,
    date: new Date().toISOString(),
    rating: 0,
    review: "",
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values) => {
        console.log(values); // handle form submission
      }}
    >
      {({ values, setFieldValue, isSubmitting }) => (
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
