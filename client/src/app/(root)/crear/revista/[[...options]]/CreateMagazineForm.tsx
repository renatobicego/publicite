"use client";

import ErrorCard from "@/components/ErrorCard";
import {
  createMagazineValues,
  groupMagazine,
  userMagazine,
} from "./initialValues";
import { useRouter } from "next-nprogress-bar";
import { Form, Formik, FormikHelpers } from "formik";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { magazineValidation } from "./validation";
import Inputs from "./inputs/Inputs";
import { createMagazine } from "../../../../server/magazineActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { MAGAZINES } from "@/utils/data/urls";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { PostUserMagazine, PostGroupMagazine } from "@/types/magazineTypes";
import { emitGroupNotification } from "@/components/notifications/groups/emitNotifications";
import { useSocket } from "@/app/socketProvider";
import { emitMagazineNotification } from "@/components/notifications/magazines/emitNotifications";
import { useUserData } from "@/app/(root)/providers/userDataProvider";

const CreateMagazineForm = ({
  isGroupMagazine,
  id,
  shareMagazineIds,
  userId,
}: {
  isGroupMagazine: boolean;
  id: string | null;
  shareMagazineIds: {
    user: string;
    post: string;
  } | null;
  userId: string;
}) => {
  const initialValues = isGroupMagazine
    ? groupMagazine
    : ({
        ...userMagazine,
        collaborators: shareMagazineIds ? [shareMagazineIds.user] : [],
      } as PostUserMagazine);
  const router = useRouter();
  const { updateSocketToken } = useSocket();
  const { userIdLogged, usernameLogged } = useUserData();

  if (isGroupMagazine && !id) {
    return (
      <ErrorCard message="Hubo un error al traer los datos del grupo. Por favor intenta de nuevo." />
    );
  }

  const handleSubmit = async (
    values: PostUserMagazine | PostGroupMagazine,
    actions: FormikHelpers<PostUserMagazine | PostGroupMagazine>
  ) => {
    const finalValues = createMagazineValues(
      values,
      isGroupMagazine,
      id,
      shareMagazineIds,
      userId
    );

    const resApi = await createMagazine(finalValues);
    if (resApi.error) {
      toastifyError(resApi.error);
      actions.setSubmitting(false);
      return;
    }
    const socket = await updateSocketToken();
    if (isGroupMagazine) {
      (finalValues as PostGroupMagazine).allowedCollaborators.forEach(
        (collaborator) => {
          // emit notifications user invited to collaborate in magazine
          emitMagazineNotification(
            socket,
            {
              _id: resApi.id,
              name: finalValues.name,
              ownerType: finalValues.ownerType,
            },
            {
              username: usernameLogged as string,
              _id: userIdLogged as string,
            },
            collaborator,
            "notification_magazine_new_user_invited"
          );
        }
      );
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
      {({ isSubmitting, errors, setValues, values }) => {
        return (
          <Form className="flex flex-col gap-4 max-md:w-full md:max-xl:flex-1 xl:w-1/2 self-center">
            <h2>
              Crear Revista{" "}
              <span className={`${!isGroupMagazine && "hidden"}`}>
                de Grupo
              </span>
            </h2>
            <Inputs
              isUserMagazine={!isGroupMagazine}
              errors={errors}
              id={id}
              setValues={setValues}
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
