import { getNoveltyById, parseNoveltyBlocks } from "@/services/noveltyService";
import { notFound } from "next/navigation";
import NoveltyContent from "./NoveltyContent";
import ErrorCard from "@/components/ErrorCard";
import { Novedad } from "@/types/novedades";

export default async function NoveltyPage({
  params,
}: {
  params: { id: string };
}) {
  const noveltyData = await getNoveltyById(params.id);

  if (!noveltyData) {
    notFound();
  }

  if (noveltyData && "error" in noveltyData) {
    return <ErrorCard message={noveltyData.error} />;
  }

  const novelty = {
    id: noveltyData._id,
    slug: noveltyData._id,
    createdAt: noveltyData.createdAt,
    updatedAt: noveltyData.updatedAt,
    content: await parseNoveltyBlocks(noveltyData.blocks),
  };

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-8 max-w-4xl mx-auto py-8 lg:ml-[10vw] xl:ml-[15vw] 2xl:ml-[20vw]">
      <NoveltyContent novelty={novelty as Novedad} />
    </main>
  );
}
