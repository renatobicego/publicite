"use client";
import Inputs from "@/app/(root)/crear/grupo/Inputs";
import UploadProfileImage from "@/app/(root)/crear/grupo/UploadProfileImage";
import {
  groupEditValidation,
} from "@/app/(root)/crear/grupo/validation";
import { editGroup } from "@/app/server/groupActions";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { EditGroupInterface, Group } from "@/types/groupTypes";
import { User } from "@/types/userTypes";
import { GROUPS } from "@/utils/data/urls";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import useUploadImage from "@/utils/hooks/useUploadImage";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";

const EditGroup = ({ groupData }: { groupData: Group }) => {
  const initialValues: EditGroupInterface = {
    _id: groupData._id,
    name: groupData.name,
    details: groupData.details,
    rules: groupData.rules,
    magazines: groupData.magazines,
    profilePhotoUrl: groupData.profilePhotoUrl,
    visibility: groupData.visibility,
  };
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File>();
  const { submitFiles, progress, deleteFile } = useUploadImage();

  const handleSubmit = async (
    values: EditGroupInterface,
    actions: FormikHelpers<EditGroupInterface>
  ) => {
    if (photoFile) {
      const url = await submitFiles(photoFile);
      if (!url) {
        actions.setSubmitting(false);
        toastifyError("Error al subir la imagen. Por favor intenta de nuevo.");
        return;
      }
      await deleteFile(groupData.profilePhotoUrl);
      values.profilePhotoUrl = url;
    } else if (groupData.profilePhotoUrl && !values.profilePhotoUrl) {
      await deleteFile(groupData.profilePhotoUrl);
    }

    const res = await editGroup(
      values,
      groupData.admins.map((admin) => (admin as User)._id)
    );
    if ("error" in res) {
      actions.setSubmitting(false);
      toastifyError(res.error as string);
      return;
    }

    actions.setSubmitting(false);
    toastifySuccess(res.message);
    router.push(`${GROUPS}/${res.id}`);
  };

  return (
    <Formik
      validateOnBlur={false}
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={groupEditValidation}
    >
      {({ isSubmitting, errors, setFieldValue, values }) => {
        return (
          <Form className="flex gap-8 max-md:flex-col w-full lg:w-5/6 xl:w-3/4 self-center">
            <UploadProfileImage
              photoFile={photoFile}
              setPhotoFile={setPhotoFile}
              prevImage={values.profilePhotoUrl}
              setFieldValue={setFieldValue}
            />
            <div className="flex flex-col gap-4 w-full">
              <h2>Editar Grupo</h2>
              <Inputs
                setFieldValue={setFieldValue}
                errors={errors}
                showMembers={false}
                id={groupData._id}
              />
              <RequiredFieldsMsg />
              <div className="flex gap-2">
                <PrimaryButton variant="light" onPress={() => router.back()}>
                  Cancelar
                </PrimaryButton>
                <PrimaryButton
                  isDisabled={isSubmitting}
                  isLoading={isSubmitting}
                  type="submit"
                  className="self-start"
                >
                  {isSubmitting
                    ? photoFile
                      ? `Editando ${progress}%`
                      : "Editando"
                    : "Editar Grupo"}
                </PrimaryButton>
              </div>
              {Object.keys(errors).length > 0 && (
                <p className="text-danger text-sm">
                  Por favor corrija los errores
                </p>
              )}
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default EditGroup;
