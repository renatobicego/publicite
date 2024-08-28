"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { completeOnboarding } from "../_actions";
import { Form, Formik, FormikHelpers } from "formik";
import { UserPersonFormValues } from "@/types/userTypes";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import { parseDateTime } from "@internationalized/date";
import { userPersonValidation } from "./userPersonValidation";
import { Divider } from "@nextui-org/react";
import OnboardingPersonInputs from "./OnboardingPersonInputs";
const OnboardingPerson = () => {
  const [error, setError] = useState("");
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
    lastname: user.lastName ?? "",
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
      validationSchema={userPersonValidation}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ errors, setFieldValue }) => (
        <Form className="card flex flex-col items-center bg-white px-10 py-8 gap-4 lg:w-3/4 max-w-[400px]">
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
          <PrimaryButton type="submit">Completar Registro</PrimaryButton>
        </Form>
      )}
    </Formik>
  );
};

export default OnboardingPerson;
