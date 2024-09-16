import BreadcrumbsAdmin from "@/app/components/BreadcrumbsAdmin";
import ErrorCard from "@/app/components/ErrorCard";
import { getPostData } from "@/app/services/postsServices";
import { POSTS } from "@/app/utils/urls";
import Images from "./Images";
import Data from "./Data";
import { Good, Service } from "@/types/postTypes";

export default async function PostPage({ params }: { params: { id: string } }) {
  const postData: Good | Service | { error: string } = await getPostData(params.id);

  if ('error' in postData) {
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
      label: (postData as any).title,
      href: `${POSTS}/${params.id}`,
    }
  ];
  
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-6 md:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <section className="w-full flex gap-4">
        <Images images={(postData as any).imagesUrls} />
        <Data post={postData} />
      </section>
    </main>
  );
}
