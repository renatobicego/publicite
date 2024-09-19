import SecondaryButton from "../components/buttons/SecondaryButton";
import PostsGrid from "../components/grids/PostGrid";
import { mockedPetitions, mockedPosts } from "../utils/data/mockedData";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <h2>Últimos Anuncios</h2>
      <PostsGrid
        posts={[...mockedPosts, ...mockedPosts, ...mockedPosts]}
        recommendation={false}
      />
      <SecondaryButton className="self-center">
        Ver Más Anuncios
      </SecondaryButton>
      <h2 className="mt-4">¿Qué están buscando los usuarios?</h2>
      <PostsGrid
        posts={[...mockedPetitions, ...mockedPetitions, ...mockedPetitions]}
        recommendation={false}
      />
      <SecondaryButton className="self-center">
        Ver Más Necesidades
      </SecondaryButton>
    </main>
  );
}
