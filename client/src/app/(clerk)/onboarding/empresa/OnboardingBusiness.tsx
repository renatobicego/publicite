"use client";
import { useRouter } from "@bprogress/next/app";
import { Form, Formik, FormikHelpers } from "formik";
import { BusinessSector, UserBusinessFormValues } from "@/types/userTypes";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { fromAbsolute, getLocalTimeZone } from "@internationalized/date";
import OnboardingBusinessInputs from "./OnboardingBusinessInputs";
import {
  userAdAgentValidation,
  userBusinessValidation,
} from "./userBusinessValidation";
import AdAgentOnboardingInputs from "./AdAgentOnboardingInputs";
import { Divider } from "@nextui-org/react";
import { completeOnboardingBusiness } from "../_actions";
import { toastifyError } from "@/utils/functions/toastify";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { useUser } from "@clerk/nextjs";
import TermsConditions from "@/components/Footer/TermsConditions";
import { useState } from "react";
const OnboardingBusiness = ({
  user,
  businessSectors,
  isAdAgent = false,
}: {
  user: any;
  businessSectors: BusinessSector[];
  /** Alta de una cuenta Empresa / Agente (publica espacios publicitarios). */
  isAdAgent?: boolean;
}) => {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [checkboxAccept, setCheckboxAccept] = useState(false);
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
    createdTime: fromAbsolute(user.createdAt, getLocalTimeZone())
      .toAbsoluteString()
      .split(".")[0],
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
    dni: "",
    ...(isAdAgent && {
      adAgent: { website: "", taxCondition: "", taxNote: "" },
    }),
  };

  const handleSubmit = async (
    formData: UserBusinessFormValues,
    actions: FormikHelpers<UserBusinessFormValues>
  ) => {
    if (!checkboxAccept) {
      toastifyError("Debes aceptar los términos y condiciones.");
      return;
    }
    if (isAdAgent && !user.hasImage && !clerkUser?.hasImage) {
      toastifyError("Subí una foto o logo para tu cuenta.");
      return;
    }
    const res = await completeOnboardingBusiness(
      isAdAgent
        ? {
            ...formData,
            // La foto que subió en este paso (Clerk la actualiza al instante).
            profilePhotoUrl: clerkUser?.imageUrl ?? formData.profilePhotoUrl,
            contact: {
              ...formData.contact,
              website: formData.contact.website || formData.adAgent?.website,
            },
          }
        : formData
    );
    if (res?.message) {
      await clerkUser?.reload();
      router.refresh();
      return;
    }
    if (res?.error) {
      toastifyError(res.error);
    }
  };
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={
        isAdAgent ? userAdAgentValidation : userBusinessValidation
      }
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ errors, setFieldValue, isSubmitting }) => (
        <Form className="card flex flex-col items-center bg-white px-6 md:px-10 py-8 gap-4 w-5/6 md:w-3/4">
          <div>
            <h5>
              {isAdAgent
                ? "Cuenta Empresa / Agente"
                : "¡Ya casi terminamos!"}
            </h5>
            <p className="small-text">
              {isAdAgent
                ? "Con esta cuenta publicás tus espacios publicitarios. Soonpublicité genera el contacto, no realiza ventas."
                : "Complete los últimos datos."}
            </p>
          </div>
          <Divider />
          <OnboardingBusinessInputs
            errors={errors}
            setFieldValue={setFieldValue}
            businessSectors={businessSectors}
            isAdAgent={isAdAgent}
          />
          {isAdAgent && (
            <AdAgentOnboardingInputs
              errors={errors}
              hasImage={!!(user.hasImage || clerkUser?.hasImage)}
            />
          )}
          <TermsConditions
            showCheckbox={true}
            checkboxAccept={checkboxAccept}
            setCheckboxAccept={setCheckboxAccept}
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
