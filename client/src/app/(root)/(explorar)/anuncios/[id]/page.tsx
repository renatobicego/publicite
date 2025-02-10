import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import { getPostDataAndRecommended } from "@/services/postsServices";
import { POSTS } from "@/utils/data/urls";
import Images from "./Images";
import Data from "./Data/Data";
import { Good, Petition, Post, Service } from "@/types/postTypes";
import Comments from "./Comments/Comments";
import RecommendedPosts from "./RecommendedPosts";
import { currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";
import Loading from "./loading";

export default async function PostPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const postData:
    | { post: Good | Service | Petition; recomended: Post[] }
    | { error: string } = await getPostDataAndRecommended(params.id);

  if (!postData) {
    return (
      <ErrorCard message="Error al traer los datos. El anuncio no existe." />
    );
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
      label: postData.post.title,
      href: `${POSTS}/${params.id}`,
    },
  ];

  const { post, recomended } = postData;
  const user = await currentUser();
  const isAuthor = post.author.username === user?.username;
  const isPetition = post.postType === "petition";

  return (
    <Suspense fallback={<Loading />}>
      <main className="flex min-h-screen flex-col items-start main-style gap-6 md:gap-8">
        <BreadcrumbsAdmin items={breadcrumbsItems} />
        <section className="w-full flex max-lg:flex-col gap-4 lg:gap-6 3xl:gap-8 relative">
          {!isPetition && <Images images={(post as any).imagesUrls} />}
          <Data post={post} isAuthor={isAuthor} isPetition={isPetition} />
        </section>
        <section className="w-full flex max-lg:flex-col gap-4 lg:gap-6 3xl:gap-8 md:mt-6 xl:mt-8">
          <Comments
            comments={post.comments}
            post={{
              _id: post._id,
              title: post.title,
              postType: post.postType,
              imageUrl:
                "imagesUrls" in post && post.imagesUrls
                  ? post.imagesUrls[0]
                  : "",
            }}
            isAuthor={isAuthor}
            authorId={post.author._id}
          />
          <RecommendedPosts recommendedPosts={recomended} />
        </section>
      </main>
    </Suspense>
  );
}
