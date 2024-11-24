"use client";
import { useRouter } from "next-nprogress-bar";
import { Form, Formik, FormikHelpers } from "formik";
import { UserPersonFormValues } from "@/types/userTypes";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { fromAbsolute, getLocalTimeZone } from "@internationalized/date";
import { userPersonValidation } from "./userPersonValidation";
import { Divider } from "@nextui-org/react";
import OnboardingPersonInputs from "./OnboardingPersonInputs";
import { completeOnboardingPerson } from "../_actions";
import { toastifyError } from "@/utils/functions/toastify";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { useUser } from "@clerk/nextjs";
const OnboardingPerson = ({user} : {user: any}) => {
  const router = useRouter();
  const {user: clerkUser} = useUser();
  if (!user) return null;

  const initialValues: UserPersonFormValues = {
    clerkId: user?.id as string,
    contact: {
      phone: "",
    },
    countryRegion: "",
    createdTime:fromAbsolute(user.createdAt, getLocalTimeZone()).toAbsoluteString().split(".")[0],
    description: "",
    email: user.emailAddress,
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
      await clerkUser?.reload();
      router.refresh();
      return
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
        {({ errors, setFieldValue, isSubmitting, setFieldError }) => (
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
              setFieldError={setFieldError}
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
