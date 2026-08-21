import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Todo /admin exige rol admin. Es la primera de tres barreras: acá (server
 * component), en el middleware, y en el resolver de GraphQL, que es la única
 * que realmente protege los datos.
 */
export default function AdminLayoutGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const loggedUser = auth();
  if (!loggedUser.userId) {
    redirect("/iniciar-sesion");
  }
  if (loggedUser.sessionClaims?.metadata?.role !== "admin") {
    redirect("/");
  }
  return <>{children}</>;
}
