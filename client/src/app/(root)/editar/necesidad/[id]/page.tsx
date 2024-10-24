import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import { getPostData } from "@/services/postsServices";
import { Good, Petition, Service } from "@/types/postTypes";
import { EDIT_PETITION, EDIT_POST, POSTS } from "@/utils/data/urls";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EditPetitionClient from "./EditPetitionClient";
export default async function EditPetitionPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const postData: Petition | { error: string } = await getPostData(params.id);
  const userLogged = await currentUser();
  if (
    !("error" in postData) &&
    userLogged?.username !== postData.author.username
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
      label: "Necesidades",
      href: `${POSTS}/necesidades`,
    },
    {
      label: postData.title,
      href: `${POSTS}/${params.id}`,
    },
    {
      label: "Editar",
      href: `${EDIT_PETITION}/${params.id}`,
    },
  ];
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <h2>Editar Necesidad</h2>
      <EditPetitionClient postData={postData} />
    </main>
  );
}
