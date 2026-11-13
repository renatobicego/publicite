import { auth } from "@clerk/nextjs/server";
import { Image } from "@nextui-org/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AFTER_ONBOARDING_COOKIE,
  safeAfterOnboardingPath,
} from "@/utils/functions/afterOnboarding";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if ((await auth()).sessionClaims?.metadata.onboardingComplete === true) {
    // Vuelve al link de regalo o de Hacete Amigo desde el que se registró (la
    // pantalla de destino borra la cookie).
    const returnPath = safeAfterOnboardingPath(
      (await cookies()).get(AFTER_ONBOARDING_COOKIE)?.value
    );
    redirect(returnPath ?? "/");
  }

  return (
    <main className="w-screen min-h-screen flex bg-fondo flex-col lg:flex-row">
      <div className="flex justify-center items-center lg:bg-fondo lg:flex-1 h-screen 
      max-lg:absolute max-lg:top-4 max-lg:left-8 max-lg:size-20">
        <Image src="/logo.png" alt="Logo" width={300} height={200} className="object-contain"/>
      </div>
      <div className="flex justify-center items-center lg:bg-white flex-1 rounded-[40px] shadow-xl py-16 max-lg:mt-8">
        {children}
      </div>
      
    </main>
  );
}
