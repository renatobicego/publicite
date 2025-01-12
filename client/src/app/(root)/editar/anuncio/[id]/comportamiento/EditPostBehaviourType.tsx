"use client";
import Visibility from "@/app/(root)/crear/anuncio/components/CreateForm/inputs/AccordionInputs/Visibility";
import PostsLimitReached from "@/app/(root)/crear/anuncio/components/PostsLimitReached";
import SelectPostBehaviourType from "@/app/(root)/crear/anuncio/components/SelectPostBehaviourType";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { PostBehaviourType } from "@/types/postTypes";
import useUserPostLimit from "@/utils/hooks/useUserPostLimit";
import { Spinner } from "@nextui-org/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useState } from "react";

interface EditPostBehaviourTypeProps {
  id: string;
  postBehaviourType: PostBehaviourType;
  authorId?: string;
  visibility: {
    post: Visibility;
    socialMedia: Visibility;
  };
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
}: EditPostBehaviourTypeProps) => {
  const initialValues: EditPostBehaviourTypeFormValues = {
    postBehaviourType,
    authorId,
    visibility,
  };

  const [currentPostBehaviourType, setCurrentPostBehaviourType] =
    useState(postBehaviourType);
  const { userCanPublishPost, limit, numberOfPosts, loading } =
    useUserPostLimit(authorId || "", currentPostBehaviourType);

  const handleSubmit = async (
    values: EditPostBehaviourTypeFormValues,
    actions: FormikHelpers<EditPostBehaviourTypeFormValues>
  ) => {};

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
