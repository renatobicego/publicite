"use client";

import ErrorCard from "@/components/ErrorCard";
import {
  groupMagazine,
  PostGroupMagazine,
  PostUserMagazine,
  userMagazine,
} from "./initialValues";
import { useRouter } from "next/navigation";
import { Form, Formik, FormikHelpers } from "formik";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { magazineValidation } from "./validation";
import Inputs from "./Inputs";
import { useUser } from "@clerk/nextjs";
import { createMagazine } from "../../../../server/magazineActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { MAGAZINES } from "@/utils/data/urls";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";

const CreateMagazineForm = ({
  isGroupMagazine,
  id,
}: {
  isGroupMagazine: boolean;
  id: string | null;
}) => {
  const initialValues = isGroupMagazine ? groupMagazine : userMagazine;
  const router = useRouter();
  const { user } = useUser();

  if (isGroupMagazine && !id) {
    return (
      <ErrorCard message="Hubo un error al traer los datos del grupo. Por favor intenta de nuevo." />
    );
  }

  const handleSubmit = async (
    values: PostUserMagazine | PostGroupMagazine,
    actions: FormikHelpers<PostUserMagazine | PostGroupMagazine>
  ) => {
    if (isGroupMagazine) {
      values = {
        ...values,
        group: id,
      } as PostGroupMagazine;
    } else {
      values = {
        ...values,
        user: user?.publicMetadata.mongoId,
      } as PostUserMagazine;
    }
    if (id && !isGroupMagazine) {
      values = {
        ...values,
        addedPost: id,
      } as any;
    }

    const resApi = await createMagazine(values);
    if (resApi.error) {
      toastifyError(resApi.error);
      actions.setSubmitting(false);
      return;
    }
    toastifySuccess(resApi.message as string);
    router.push(`${MAGAZINES}/${resApi.id}`);
  };
  return (
    <Formik
      validateOnBlur={false}
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={magazineValidation}
    >
      {({ isSubmitting, errors, setFieldValue }) => {
        return (
          <Form className="flex flex-col gap-4 max-md:w-full md:max-xl:flex-1 xl:w-1/2 self-center">
            <h2>Crear Revista</h2>
            <Inputs
              isUserMagazine={!isGroupMagazine}
              errors={errors}
              setFieldValue={setFieldValue}
            />
            <RequiredFieldsMsg />
            <PrimaryButton
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              type="submit"
              className="mt-4 self-start"
            >
              {isSubmitting ? "Creando" : "Crear Revista"}
            </PrimaryButton>
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

export default CreateMagazineForm;
