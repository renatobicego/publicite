"use client";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { Form, Formik, FormikHelpers } from "formik";
import Inputs from "./Inputs";
import UploadProfileImage from "./UploadProfileImage";
import { useState } from "react";
import useUploadImage from "@/utils/hooks/useUploadImage";
import { createGroup } from "@/app/server/groupActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { GROUPS } from "@/utils/data/urls";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { useRouter } from "next-nprogress-bar";
import { groupValidation } from "./validation";
import { Group } from "@/types/groupTypes";
import { emitGroupNotification } from "@/components/notifications/groups/emitNotifications";
import { useSocket } from "@/app/socketProvider";
import { useUserData } from "../../userDataProvider";

export type PostGroup = Omit<Group, "_id" | "creator">;
const CreateGroupForm = () => {
  const { usernameLogged, userIdLogged } = useUserData();
  const initialValues: PostGroup = {
    name: "",
    alias: "",
    admins: [],
    details: "",
    rules: "",
    magazines: [],
    members: [],
    profilePhotoUrl: "",
    visibility: "public",
  };
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File>();
  const { submitFiles, progress, deleteFile } = useUploadImage();
  const { socket } = useSocket();
  const handleSubmit = async (
    values: PostGroup,
    actions: FormikHelpers<PostGroup>
  ) => {
    if (photoFile) {
      const url = await submitFiles(photoFile);
      if (!url) {
        actions.setSubmitting(false);
        return;
      }
      values.profilePhotoUrl = url;
    }
    const resApi = await createGroup(values);
    if (resApi.error) {
      await deleteFile(values.profilePhotoUrl);
      toastifyError(resApi.error);
      actions.setSubmitting(false);
      return;
    }
    resApi.group.members.forEach((member: string) => {
      emitGroupNotification(
        socket,
        resApi.group,
        { username: usernameLogged as string, _id: userIdLogged as string },
        member,
        "notification_group_new_user_added"
      );
    });
    toastifySuccess(resApi.message as string);
    router.push(`${GROUPS}/${resApi.group._id}`);
  };
  return (
    <Formik
      validateOnBlur={false}
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={groupValidation}
    >
      {({ isSubmitting, errors, setFieldValue, setFieldError }) => {
        return (
          <Form className="flex gap-8 max-md:flex-col w-full lg:w-5/6 xl:w-3/4 self-center">
            <UploadProfileImage
              photoFile={photoFile}
              setPhotoFile={setPhotoFile}
            />
            <div className="flex flex-col gap-4 w-full">
              <h2>Crear Grupo</h2>
              <Inputs
                setFieldValue={setFieldValue}
                errors={errors}
                setFieldError={setFieldError}
              />
              <RequiredFieldsMsg />
              <div className="mt-4 flex gap-2 items-center">
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
                      ? `Creando ${progress}%`
                      : "Creando"
                    : "Crear Grupo"}
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

export default CreateGroupForm;
