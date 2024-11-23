import { currentUser } from "@clerk/nextjs/server";
import OnboardingPerson from "./OnboardingPerson";
import { redirect } from "next/navigation";

export default async function PersonaOnBoardingPage() {
    const user = await currentUser()
  if(!user) return redirect("/iniciar-sesion")
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
  return <OnboardingPerson user={plainUser}/>;
}
