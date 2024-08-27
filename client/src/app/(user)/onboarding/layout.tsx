import { auth } from "@clerk/nextjs/server";
import { Image } from "@nextui-org/react";
import { redirect } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // if (auth().sessionClaims?.metadata.onboardingComplete === true) {
  //   redirect("/perfil");
  // }

  return (
    <main className="w-screen h-screen flex">
      <div className="flex justify-center items-center bg-fondo flex-1">
        <Image src="/logo.png" alt="Logo" width={300} height={200} />
      </div>

      {children}
    </main>
  );
}
