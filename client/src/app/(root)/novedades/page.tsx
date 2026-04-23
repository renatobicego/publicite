import { auth } from "@clerk/nextjs/server";
import { NovedadesGrid } from "./NovedadesGrid";
import { getAllNovelties, parseNoveltyBlocks } from "@/services/noveltyService";
import Link from "next/link";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import ErrorCard from "@/components/ErrorCard";
import { Novedad } from "@/types/novedades";

export default async function NovedadesPage() {
  const loggedUser = auth();
  const role = loggedUser.sessionClaims?.metadata?.role;
  const isAdmin = role === "admin";

  // Fetch novelties from backend
  const noveltiesData = await getAllNovelties();

  if (noveltiesData && "error" in noveltiesData) {
    return <ErrorCard message={noveltiesData.error} />;
  }
  
  // Transform backend data to frontend format
  const novedades = await Promise.all(noveltiesData.map(async(novelty) => ({
    id: novelty._id,
    slug: novelty._id,
    createdAt: novelty.createdAt,
    updatedAt: novelty.updatedAt,
    content: await parseNoveltyBlocks(novelty.blocks),
  })));

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-8">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold">
          Novedades de Soonpublicité
        </h1>
        {isAdmin && (
          <Link href="/novedades/admin">
            <PrimaryButton>Crear Novedad</PrimaryButton>
          </Link>
        )}
      </div>
      <NovedadesGrid novedades={novedades as Novedad[]} isAdmin={isAdmin} />
    </main>
  );
}
