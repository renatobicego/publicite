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
import { useSocket } from "@/app/socketProvider";
import { emitMagazineNotification } from "@/components/notifications/magazines/emitNotifications";
import {
  useMagazinesData,
  useUserData,
} from "@/app/(root)/providers/userDataProvider";

const CreateMagazineForm = ({
  isGroupMagazine,
  id, // if is group magazine, this will be the id of the group. If is user magazine, this will be post id if being sent
  shareMagazineIds, // if is shared magazine, this will be the object shareMagazineIds with user being invited and post id if being added
  userId, // user id of the creator
}: {
  isGroupMagazine: boolean;
  id: string | null;
  shareMagazineIds: {
    user: string;
    post: string;
  } | null;
  userId: string;
}) => {
  // get initial values for form
  const initialValues = isGroupMagazine ? groupMagazine : userMagazine;
  const router = useRouter();
  const { socket } = useSocket();
  const { userIdLogged, usernameLogged } = useUserData();
  const { addMagazineToStore } = useMagazinesData();

  // if is group magazine but id of the group is not provided, throw error
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

    const resApi = await createMagazine({
      ...finalValues,
      [isGroupMagazine ? "allowedCollaborators" : "collaborators"]: [], // sent empty collaborators, we will send a notification to each to invite them
    });
    if (resApi.error) {
      toastifyError(resApi.error);
      actions.setSubmitting(false);
      return;
    }
    if (!resApi.data) {
      toastifyError(
        "Hubo un error al crear la revista. Por favor intenta de nuevo."
      );
      actions.setSubmitting(false);
      return;
    }
    // to who send notifications
    const usersToSendNotifications = isGroupMagazine // if it is group magazine, send notifications to all allowed collaborators added
      ? (finalValues as PostGroupMagazine).allowedCollaborators
      : // else if it's a shared magazine
      shareMagazineIds?.user
      ? [
          shareMagazineIds.user, // send to the user that was added by url
          ...(finalValues as PostUserMagazine).collaborators, // and also all the collaborators that were added after on the select
        ]
      : (finalValues as PostUserMagazine).collaborators; // else if it's a user magazine, send notifications to all collaborators added

    usersToSendNotifications.forEach((collaborator) => {
      // emit notifications user invited to collaborate in magazine
      emitMagazineNotification(
        socket,
        {
          _id: resApi?.data?._id as string,
          name: finalValues.name,
          ownerType: finalValues.ownerType,
        },
        {
          username: usernameLogged as string,
          _id: userIdLogged as string,
        },
        collaborator,
        "notification_magazine_new_user_invited",
        null
      );
    });
    addMagazineToStore(resApi.data);
    actions.resetForm();
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
      {({ isSubmitting, errors, setValues }) => {
        return (
          <Form
            id="create-magazine-form"
            className="flex flex-col gap-4 max-md:w-full md:max-xl:flex-1 xl:w-1/2 self-center"
          >
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
