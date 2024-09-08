"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Form, Formik, FormikHelpers } from "formik";
import { UserBusinessFormValues } from "@/types/userTypes";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { parseDateTime } from "@internationalized/date";
import OnboardingBusinessInputs from "./OnboardingBusinessInputs";
import { userBusinessValidation } from "./userBusinessValidation";
import { Divider } from "@nextui-org/react";
import { completeOnboardingBusiness } from "../_actions";
import { toastifyError } from "@/app/utils/toastify";
const OnboardingBusiness = () => {
  const { user } = useUser();
  const router = useRouter();
  if (!user) return null;
  const initialValues: UserBusinessFormValues = {
    clerkId: user?.id as string,
    contact: {
      phone: "",
      instagram: "",
      facebook: "",
      x: "",
      website: "",
    },
    countryRegion: "",
    createdTime: user.createdAt
      ? parseDateTime(user.createdAt.toISOString().split(".")[0]).toString()
      : parseDateTime(new Date().toISOString().split(".")[0]).toString(),
    description: "",
    email: user?.emailAddresses[0].emailAddress,
    isActive: true,
    businessName: "",
    profilePhotoUrl: user?.imageUrl,
    userType: "Business",
    username: user.username as string,
    sector: "",
    name: user.firstName as string,
    lastName: user.lastName as string,
  };

  const handleSubmit = async (
    formData: UserBusinessFormValues,
    actions: FormikHelpers<UserBusinessFormValues>
  ) => {
    const res = await completeOnboardingBusiness(formData);
    if (res?.message) {
      // Reloads the user's data from Clerk's API
      await user?.reload();
      router.push("/");
    }
    if (res?.error) {
      toastifyError(res.error);
    }
  };
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={userBusinessValidation}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ errors, setFieldValue, isSubmitting }) => (
        <Form className="card flex flex-col items-center bg-white px-6 md:px-10 py-8 gap-4 w-5/6 md:w-3/4">
          <div>
            <h5>¡Ya casi terminamos!</h5>
            <p className="small-text">Complete los últimos datos.</p>
          </div>
          <Divider />
          <OnboardingBusinessInputs
            errors={errors}
            setFieldValue={setFieldValue}
          />
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
  );
};

export default OnboardingBusiness;
