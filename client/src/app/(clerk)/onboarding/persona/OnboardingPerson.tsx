"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next-nprogress-bar";
import { Form, Formik, FormikHelpers } from "formik";
import { UserPersonFormValues } from "@/types/userTypes";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { parseDateTime } from "@internationalized/date";
import { userPersonValidation } from "./userPersonValidation";
import { Divider } from "@nextui-org/react";
import OnboardingPersonInputs from "./OnboardingPersonInputs";
import { completeOnboardingPerson } from "../_actions";
import { toastifyError } from "@/utils/functions/toastify";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
const OnboardingPerson = () => {
  const { user } = useUser();
  const router = useRouter();
  if (!user) return null;

  const initialValues: UserPersonFormValues = {
    clerkId: user?.id as string,
    contact: {
      phone: "",
    },
    countryRegion: "",
    createdTime: user.createdAt
      ? parseDateTime(user.createdAt.toISOString().split(".")[0]).toString()
      : parseDateTime(new Date().toISOString().split(".")[0]).toString(),
    description: "",
    email: user?.emailAddresses[0].emailAddress,
    isActive: true,
    lastName: user.lastName ?? "",
    name: user.firstName ?? "",
    profilePhotoUrl: user?.imageUrl,
    userType: "Person",
    username: user.username as string,
    birthDate: "",
    gender: "",
  };

  const handleSubmit = async (
    formData: UserPersonFormValues,
    actions: FormikHelpers<UserPersonFormValues>
  ) => {
    const res = await completeOnboardingPerson(formData);
    if (res?.message) {
      // Reloads the user's data from Clerk's API
      await user?.reload();
      router.replace("/");
    }
    if (res?.error) {
      toastifyError(res.error);
    }
  };
  return (
    <>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={userPersonValidation}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ errors, setFieldValue, isSubmitting }) => (
          <Form className="card flex flex-col items-center bg-white px-6 md:px-10 py-8 gap-4 w-5/6 md:w-3/4 max-w-[400px]">
            <div>
              <h5>¡Ya casi terminamos!</h5>
              <p className="small-text">Complete los últimos datos.</p>
            </div>

            <Divider />
            <OnboardingPersonInputs
              errors={errors}
              setFieldValue={setFieldValue}
              initialValues={initialValues}
            />
            <RequiredFieldsMsg />
            <PrimaryButton
              type="submit"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Completar Registro
            </PrimaryButton>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default OnboardingPerson;
