import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import { getPostData } from "@/services/postsServices";
import { Good, Service } from "@/types/postTypes";
import { EDIT_POST, NEEDS, POSTS } from "@/utils/data/urls";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EditPostBehaviourType from "./EditPostBehaviourType";
import PostCard from "@/components/cards/PostCard/PostCard";

export default async function ModifyPostBehaviour(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const postData: Good | Service | { error: string } = await getPostData(
    params.id
  );
  const userLogged = auth();
  if (
    !("error" in postData) &&
    userLogged?.sessionClaims?.metadata.mongoId !== postData.author._id
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
      href: `${postData.postType === "petition" ? NEEDS : POSTS}/${params.id}`,
    },
    {
      label: "Editar Comportamiento",
      href: `${EDIT_POST}/${params.id}/comportamiento`,
    },
  ];
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <h2>Editar Comportamiento de Anuncio/Necesidad</h2>
      <section className="flex flex-col gap-4 md:flex-row w-full justify-start items-start relative">
        <PostCard
          interactable={false}
          postData={postData}
          recommendation={false}
          className="max-w-[50vw] md:max-w-[30vw] lg:max-w-[25vw] 3xl:max-w-[20vw]"
        />
        <EditPostBehaviourType
          id={postData._id}
          postType={postData.postType}
          postBehaviourType={postData.postBehaviourType}
          authorId={userLogged?.sessionClaims?.metadata.mongoId}
          visibility={postData.visibility}
        />
      </section>
    </main>
  );
}
