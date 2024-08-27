"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { completeOnboarding } from "../_actions";
import { Form, Formik, FormikHelpers } from "formik";
import { UserPersonFormValues } from "@/types/userTypes";
import { userPersonValidation } from "./userPersonValidation";

export default function PersonaOnBoardingPage() {
  const [error, setError] = useState("");
  const { user } = useUser();
  const router = useRouter();
  if (!user) return null;
  const initialValues: UserPersonFormValues = {
    clerkId: user?.id as string,
    contact: {
      phone: user.phoneNumbers[0].phoneNumber,
    },
    countryRegion: "",
    createdTime: user.createdAt?.toString() as string,
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
    >
      <Form></Form>
    </Formik>
  );
}
