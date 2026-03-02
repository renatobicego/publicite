import FormBlogPost from "./FormBlogPost";

export default function CreateEditBlog({ params }: { params: { id: string } }) {
  const id = params.id;
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-6 md:gap-8 max-w-screen-lg  py-8">
      <h1 className="text-3xl md:text-[2.5rem] xl:text-5xl font-semibold">
        {!id ? "Crear Novedad" : "Editar Novedad"}
      </h1>
      <FormBlogPost />
    </main>
  );
}
