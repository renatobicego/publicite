import PrimaryButton from "@/components/buttons/PrimaryButton";
import { Group } from "@/types/userTypes";
import { GROUPS } from "@/utils/data/urls";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useUser } from "@clerk/nextjs";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import Inputs from "./Inputs";

export type PostGroup = Omit<Group, "_id">
const CreateGroupForm = () => {
    const { user } = useUser();
    const initialValues: PostGroup = {
        name: "",
        admins: [user?.publicMetadata.mongoId as string],
        details: "",
        rules: "",
        magazines: [],
        members: [],
        profilePhotoUrl: "",
        visibility: "public",
    }
    const router = useRouter();
  
    const handleSubmit = async (
      values: PostGroup,
      actions: FormikHelpers<PostGroup>
    ) => {
  
    //   const resApi = await createMagazine(values);
    //   if (resApi.error) {
    //     toastifyError(resApi.error);
    //     return;
    //   }
    //   toastifySuccess("Revista creada exitosamente");
    //   router.push(`${GROUPS}/${resApi.id}`);
    };
    return (
      <Formik
        validateOnBlur={false}
        validateOnChange={false}
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, setFieldValue }) => {
          return (
            <Form className="flex flex-col gap-4 max-md:w-full md:max-xl:flex-1 xl:w-1/2 self-center">
              <h2>Crear Grupo</h2>
              <Inputs setFieldValue={setFieldValue} errors={errors} />
              <PrimaryButton
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
                type="submit"
                className="mt-4 self-start"
              >
                {isSubmitting ? "Creando" : "Crear Grupo"}
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
}

export default CreateGroupForm