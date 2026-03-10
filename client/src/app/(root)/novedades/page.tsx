import { auth } from "@clerk/nextjs/server";
import { NovedadesGrid } from "./NovedadesGrid";
import { mockNovedades } from "@/utils/data/mock-novedades";

export default function NovedadesPage() {
  // In real app, this would come from your auth provider (e.g., Clerk)
  const loggedUser = auth();
  const role = loggedUser.sessionClaims?.metadata?.role;
  const isAdmin = role === "admin";

  // In real app, this would be fetched from your API
  const novedades = mockNovedades;

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-8">
      <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold">
        Novedades de Soonpublicité
      </h1>
      <NovedadesGrid novedades={novedades} isAdmin={isAdmin} />
    </main>
  );
}
