import { currentUser } from "@clerk/nextjs/server";
import OnboardingBusiness from "../empresa/OnboardingBusiness";
import { redirect } from "next/navigation";
import { getBusinessSector } from "@/services/businessServices";
import { BusinessSector } from "@/types/userTypes";
import ErrorCard from "@/components/ErrorCard";

export default async function AgentOnBoardingPage() {
  const user = await currentUser();
  if (!user) return redirect("/iniciar-sesion");
  // Extract only serializable fields
  const plainUser = {
    id: user.id,
    emailAddress: user?.emailAddresses[0].emailAddress,
    imageUrl: user.imageUrl,
    // La cuenta Empresa / Agente necesita una foto propia (no la de Clerk).
    hasImage: user.hasImage,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
  };
  const businessSectors: BusinessSector[] | { error: string } =
    await getBusinessSector();
  if ("error" in businessSectors)
    return (
      <ErrorCard
        message="Hubo un error inesperado. Por favor, recargue la página e intente de nuevo."
        error={businessSectors.error}
      />
    );

  return (
    <OnboardingBusiness
      user={plainUser}
      businessSectors={businessSectors}
      isAdAgent
    />
  );
}
