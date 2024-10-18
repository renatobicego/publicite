"use client";
import { magazineValidation } from "@/app/(root)/crear/revista/[[...options]]/validation";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { EditMagazine, Magazine, UserMagazine } from "@/types/magazineTypes";
import { MAGAZINES } from "@/utils/data/urls";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next-nprogress-bar";
import EditMagazineInputs from "./EditMagazineInputs";

const EditMagazineForm = ({
  isGroupMagazine,
  magazineData,
}: {
  isGroupMagazine: boolean;
  magazineData: Magazine;
}) => {
  const initialValues: EditMagazine = {
    name: magazineData.name,
    description: magazineData.description,
    ownerType: isGroupMagazine ? "group" : "user",
    visibility: (magazineData as UserMagazine).visibility
      ? (magazineData as UserMagazine).visibility
      : undefined,
  };
  const router = useRouter();

  const handleSubmit = async (
    values: EditMagazine,
    actions: FormikHelpers<EditMagazine>
  ) => {
    // const resApi = await createMagazine(finalValues);
    // if (resApi.error) {
    //   toastifyError(resApi.error);
    //   actions.setSubmitting(false);
    //   return;
    // }
    // toastifySuccess(resApi.message as string);
    // router.push(`${MAGAZINES}/${resApi.id}`);
  };
  return (
    <Formik
      validateOnBlur={false}
      validateOnChange={false}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={magazineValidation}
    >
      {({ isSubmitting, errors }) => {
        return (
          <Form className="flex flex-col gap-4 max-md:w-full md:max-xl:flex-1 xl:w-1/2">
            <EditMagazineInputs
              errors={errors}
              isUserMagazine={!isGroupMagazine}
            />
            <RequiredFieldsMsg />
            <div className="mt-4 flex gap-2 items-center">
              <PrimaryButton onPress={() => router.back()} variant="light">
                Cancelar
              </PrimaryButton>
              <PrimaryButton
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
                type="submit"
                className=" self-start"
              >
                {isSubmitting ? "Editando" : "Editar Revista"}
              </PrimaryButton>
            </div>
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

export default EditMagazineForm;
