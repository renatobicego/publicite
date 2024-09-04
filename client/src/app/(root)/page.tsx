import SecondaryButton from "../components/buttons/SecondaryButton";
import PostsGrid from "../components/grids/PostGrid";
import { mockedPetitions, mockedPosts } from "../utils/mockedData";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <h3>Últimos Anuncios</h3>
      <PostsGrid
        posts={[...mockedPosts, ...mockedPosts, ...mockedPosts]}
        recommendation={false}
      />
      <SecondaryButton className="self-center">
        Ver Más Anuncios
      </SecondaryButton>
      <h3 className="mt-4">¿Qué están buscando los usuarios?</h3>
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
