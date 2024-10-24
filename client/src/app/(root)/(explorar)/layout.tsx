import SolapasTabs from "@/components/solapas/SolapasTabs";
import { currentUser } from "@clerk/nextjs/server";

export default async function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userLogged = await currentUser();
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      {children}
      <SolapasTabs
        usernameUserLogged={userLogged?.username}
        idUserLogged={userLogged?.publicMetadata.mongoId}
      />
    </main>
  );
}
