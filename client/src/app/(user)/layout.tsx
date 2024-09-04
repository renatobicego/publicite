import { auth } from "@clerk/nextjs/server";
import { Image } from "@nextui-org/react";
import { redirect } from "next/navigation";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (auth().sessionClaims?.metadata.onboardingComplete === true) {
    redirect("/perfil");
  }

  return (
    <main className="w-screen min-h-screen flex bg-fondo">
      <div className="flex justify-center items-center bg-fondo flex-1 h-screen">
        <Image src="/logo.png" alt="Logo" width={300} height={200} />
      </div>
      <div className="flex justify-center items-center bg-white flex-1 rounded-[40px] shadow-xl py-16">
        {children}
      </div>
      
    </main>
  );
}
