"use client";
import Visibility from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/AccordionInputs/Visibility";
import PostsLimitReached from "@/app/(root)/crear/anuncio/components/PostsLimitReached";
import SelectPostBehaviourType from "@/app/(root)/crear/anuncio/components/SelectPostBehaviourType";
import { updatePostBehaviour } from "@/app/server/postActions";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { PostBehaviourType } from "@/types/postTypes";
import { NEEDS, POSTS } from "@/utils/data/urls";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import useUserPostLimit from "@/utils/hooks/useUserPostLimit";
import { Spinner } from "@nextui-org/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface EditPostBehaviourTypeProps {
  id: string;
  postBehaviourType: PostBehaviourType;
  authorId?: string;
  visibility: {
    post: Visibility;
    socialMedia: Visibility;
  };
  postType: PostType;
}

interface EditPostBehaviourTypeFormValues {
  postBehaviourType: PostBehaviourType;
  authorId?: string;
  visibility: {
    post: Visibility;
    socialMedia: Visibility;
  };
}

const EditPostBehaviourType = ({
  id,
  postBehaviourType,
  authorId,
  visibility,
  postType,
}: EditPostBehaviourTypeProps) => {
  const initialValues: EditPostBehaviourTypeFormValues = {
    postBehaviourType,
    authorId,
    visibility,
  };
  const router = useRouter();
  const [currentPostBehaviourType, setCurrentPostBehaviourType] =
    useState(postBehaviourType);
  const { userCanPublishPost, limit, numberOfPosts, loading } =
    useUserPostLimit(currentPostBehaviourType);

  const handleSubmit = async (
    values: EditPostBehaviourTypeFormValues,
    actions: FormikHelpers<EditPostBehaviourTypeFormValues>
  ) => {
    if (!userCanPublishPost)
      return toastifyError("Has superado el limite de anuncios");
    if (!values.postBehaviourType) {
      actions.setSubmitting(false);
      actions.setFieldError(
        "postBehaviourType",
        "Selecciona un comportamiento"
      );
      return;
    }
    const res = await updatePostBehaviour(
      id,
      values.postBehaviourType,
      values.authorId || "",
      values.visibility
    );

    if ("error" in res) {
      actions.setSubmitting(false);
      toastifyError(res.error);
      return;
    }

    actions.setSubmitting(false);
    toastifySuccess(res.message);
    router.replace(
      postType === "petition" ? `${NEEDS}/${id}` : `${POSTS}/${id}`
    );
  };

  if (loading) return <Spinner color="warning" />;
  return (
    <Formik
      validateOnBlur={false}
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, errors, setFieldValue, values }) => {
        return (
          <>
            {!userCanPublishPost && (
              <PostsLimitReached
                limit={limit[currentPostBehaviourType]}
                numberOfPosts={numberOfPosts[currentPostBehaviourType]}
                postBehaviourType={currentPostBehaviourType}
                setPostBehaviourTypeToPrevious={() => {
                  setCurrentPostBehaviourType(postBehaviourType);
                  setFieldValue("postBehaviourType", postBehaviourType);
                }}
              />
            )}
            <Form className="flex flex-col gap-4 w-full lg:w-1/2 2xl:w-1/3 justify-start mt-4">
              <SelectPostBehaviourType
                type={values.postBehaviourType}
                setType={(type) => {
                  setCurrentPostBehaviourType(type);
                  setFieldValue("postBehaviourType", type);
                  if (type === "agenda") {
                    setFieldValue("visibility.post", "contacts");
                  }
                }}
                errorMessage={errors.postBehaviourType}
              />
              <Visibility
                errors={errors}
                postBehaviourType={values.postBehaviourType}
              />
              <RequiredFieldsMsg />
              <PrimaryButton
                isDisabled={isSubmitting || !userCanPublishPost}
                isLoading={isSubmitting}
                type="submit"
                className="self-start"
              >
                {isSubmitting ? "Guardando..." : "Editar Comportamiento"}
              </PrimaryButton>
              {Object.keys(errors).length > 0 && (
                <p className="text-danger text-sm">
                  Por favor corrija los errores
                </p>
              )}
            </Form>
          </>
        );
      }}
    </Formik>
  );
};

export default EditPostBehaviourType;
