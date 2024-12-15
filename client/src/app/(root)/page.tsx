import { POSTS } from "@/utils/data/urls";
import SecondaryButton from "../../components/buttons/SecondaryButton";
import PostsGrid from "../../components/grids/PostGrid";
import { Link, Spinner } from "@nextui-org/react";
import { Post } from "@/types/postTypes";
import { fetchDataByType } from "@/utils/data/fetchDataByType";
import ErrorCard from "@/components/ErrorCard";
import { Suspense } from "react";

export default async function Home() {
  const posts = await fetchDataByType(
    Math.random() > 0.5 ? "good" : "service",
    "",
    1
  );
  const needs = await fetchDataByType("petition", "", 1);

  if (posts.error || needs.error) {
    return (
      <ErrorCard error="Hubo un error inesperado. Por favor, recargue la página e intente de nuevo." />
    );
  }

  return (
    <Suspense fallback={<Spinner color="warning" />}>
      <main className="flex min-h-screen flex-col items-start main-style gap-4">
        <h2>Últimos Anuncios</h2>
        <PostsGrid posts={posts.items as Post[]} recommendation={false} />
        <SecondaryButton as={Link} href={POSTS} className="self-center">
          Ver Más Anuncios
        </SecondaryButton>
        <h2 className="mt-4">¿Qué están buscando los usuarios?</h2>
        <PostsGrid posts={needs.items as Post[]} recommendation={false} />
        <SecondaryButton
          as={Link}
          href={`${POSTS}/necesidades`}
          className="self-center"
        >
          Ver Más Necesidades
        </SecondaryButton>
      </main>
    </Suspense>
  );
}
