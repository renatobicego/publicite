"use client";
import { useRouter } from "next-nprogress-bar";
import { Form, Formik, FormikHelpers } from "formik";
import { UserBusinessFormValues } from "@/types/userTypes";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { fromAbsolute, getLocalTimeZone } from "@internationalized/date";
import OnboardingBusinessInputs from "./OnboardingBusinessInputs";
import { userBusinessValidation } from "./userBusinessValidation";
import { Divider } from "@nextui-org/react";
import { completeOnboardingBusiness } from "../_actions";
import { toastifyError } from "@/utils/functions/toastify";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { useUser } from "@clerk/nextjs";
const OnboardingBusiness = ({user} : {user: any}) => {
  const router = useRouter();
  const {user: clerkUser} = useUser();
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
    createdTime: fromAbsolute(user.createdAt, getLocalTimeZone()).toAbsoluteString().split(".")[0],
    description: "",
    email: user.emailAddress,
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
      await clerkUser?.reload();
      router.refresh();
      return
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
  );
};

export default OnboardingBusiness;
