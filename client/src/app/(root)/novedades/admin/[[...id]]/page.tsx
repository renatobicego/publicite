import FormBlogPost from "./FormBlogPost";
import { getNoveltyById, parseNoveltyBlocks } from "@/services/noveltyService";
import { notFound } from "next/navigation";

export default async function CreateEditBlog({
  params,
}: {
  params: { id?: string[] };
}) {
  const id = params.id?.[0];
  let defaultData = undefined;
  let properties = undefined

  if (id) {
    const noveltyData = await getNoveltyById(id);
    if (!noveltyData) {
      notFound();
    }
    if (noveltyData && !('error' in noveltyData)) {
      defaultData = await parseNoveltyBlocks(noveltyData.blocks);
      properties = noveltyData.properties
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-6 md:gap-8 max-w-screen-lg  py-8">
      <h1 className="text-3xl md:text-[2.5rem] xl:text-5xl font-semibold">
        {!id ? "Crear Novedad" : "Editar Novedad"}
      </h1>
      <FormBlogPost defaultData={defaultData} noveltyId={id} properties={properties} />
    </main>
  );
}
