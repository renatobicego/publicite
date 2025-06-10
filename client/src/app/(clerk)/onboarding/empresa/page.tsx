import { currentUser } from "@clerk/nextjs/server";
import OnboardingBusiness from "./OnboardingBusiness";
import { redirect } from "next/navigation";
import { getBusinessSector } from "@/services/businessServices";
import { BusinessSector } from "@/types/userTypes";
import ErrorCard from "@/components/ErrorCard";

export default async function PersonaOnBoardingPage() {
  const user = await currentUser();
  if (!user) return redirect("/iniciar-sesion");
  // Extract only serializable fields
  const plainUser = {
    id: user.id,
    emailAddress: user?.emailAddresses[0].emailAddress,
    imageUrl: user.imageUrl,
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
    <OnboardingBusiness user={plainUser} businessSectors={businessSectors} />
  );
}
