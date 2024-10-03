import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import { getPostData } from "@/services/postsServices";
import { Good, Service } from "@/types/postTypes";
import { EDIT_POST, POSTS } from "@/utils/data/urls";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EditPostClient from "./EditPost";
export default async function EditPost({ params }: { params: { id: string } }) {
  const postData: Good | Service | { error: string } = await getPostData(
    params.id
  );
  const currentUser = auth();
  if (
    !("error" in postData) &&
    currentUser.sessionClaims?.metadata.mongoId !== postData.author._id
  ) {
    redirect(`${POSTS}/${params.id}`);
  }
  if ("error" in postData) {
    return <ErrorCard message={postData.error} />;
  }
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Anuncios",
      href: POSTS,
    },
    {
      label: postData.title,
      href: `${POSTS}/${params.id}`,
    },
    {
      label: "Editar",
      href: `${EDIT_POST}/${params.id}`,
    },
  ];
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <h2>Editar Anuncio</h2>
      <EditPostClient postData={postData} />
    </main>
  );
}
