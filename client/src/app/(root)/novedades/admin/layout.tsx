import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function NovedadesAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const loggedUser = auth();
  if (!loggedUser) {
    redirect("/iniciar-sesion");
  }
  const role = loggedUser.sessionClaims?.metadata?.role;
  if (role !== "admin") {
    redirect("/novedades");
  }
  return <>{children}</>;
}
