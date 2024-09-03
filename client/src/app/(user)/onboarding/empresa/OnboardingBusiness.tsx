"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import { UserBusinessFormValues } from "@/types/userTypes";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { parseDateTime } from "@internationalized/date";
import OnboardingBusinessInputs from "./OnboardingBusinessInputs";
import { userBusinessValidation } from "./userBusinessValidation";
import { Divider } from "@nextui-org/react";
const OnboardingBusiness = () => {
  const [error, setError] = useState("");
  const { user } = useUser();
  const router = useRouter();
  if (!user) return null;
  const initialValues: UserBusinessFormValues = {
    clerkId: user?.id as string,
    contact: {
      phone: "",
      instagram: "",
      facebook: "",
      twitter: "",
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
    businessSector: "",

  };

  const handleSubmit = async (
    formData: UserBusinessFormValues,
    actions: FormikHelpers<UserBusinessFormValues>
  ) => {
    console.log(formData);
    // const res = await completeOnboarding(formData);
    // if (res?.message) {
    //   // Reloads the user's data from Clerk's API
    //   await user?.reload();
    //   router.push("/");
    // }
    // if (res?.error) {
    //   setError(res?.error);
    // }
  };
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={userBusinessValidation}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ errors, setFieldValue }) => (
        <Form className="card flex flex-col items-center bg-white px-10 py-8 gap-4 lg:w-3/4">
          <div>
            <h5>¡Ya casi terminamos!</h5>
            <p className="small-text">Complete los últimos datos.</p>
          </div>
          <Divider />
          <OnboardingBusinessInputs
            errors={errors}
            setFieldValue={setFieldValue}
          />
          <PrimaryButton type="submit">Completar Registro</PrimaryButton>
        </Form>
      )}
    </Formik>
  );
};

export default OnboardingBusiness;
