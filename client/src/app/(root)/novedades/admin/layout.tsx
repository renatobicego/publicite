import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function NovedadesAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loggedUser = await auth();
  if (!loggedUser) {
    redirect("/iniciar-sesion");
  }
  const role = loggedUser.sessionClaims?.metadata?.role;
  if (role !== "admin") {
    redirect("/novedades");
  }
  return <>{children}</>;
}
