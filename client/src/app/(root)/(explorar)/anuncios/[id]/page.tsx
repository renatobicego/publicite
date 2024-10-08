import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import { getPostData } from "@/services/postsServices";
import { POSTS } from "@/utils/data/urls";
import Images from "./Images";
import Data from "./Data/Data";
import { Good, Petition, Service } from "@/types/postTypes";
import Comments from "./Comments/Comments";
import { mockedPosts } from "@/utils/data/mockedData";
import RecommendedPosts from "./RecommendedPosts";
import { currentUser } from "@clerk/nextjs/server";

export default async function PostPage({ params }: { params: { id: string } }) {
  const postData: Good | Service | Petition | { error: string } =
    await getPostData(params.id);

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
      label: (postData as any).title,
      href: `${POSTS}/${params.id}`,
    },
  ];

  const user = await currentUser();
  const isAuthor = postData.author.username === user?.username;
  const isPetition = postData.postType === "petition";

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-6 md:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <section className="w-full flex max-md:flex-col gap-4 lg:gap-6 3xl:gap-8 relative">
        {!isPetition && <Images images={(postData as any).imagesUrls} />}
        <Data post={postData} isAuthor={isAuthor} isPetition={isPetition} />
      </section>
      <section className="w-full flex max-lg:flex-col gap-4 lg:gap-6 3xl:gap-8 md:mt-6 xl:mt-8">
        <Comments
          // comments={postData.comments}
          comments={[]}
          postId={postData._id}
          isAuthor={isAuthor}
        />
        <RecommendedPosts recommendedPosts={mockedPosts} />
      </section>
    </main>
  );
}
