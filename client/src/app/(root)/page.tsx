import { mockedPosts } from "@/types/mockedData";
import PostsGrid from "../components/grids/PostGrid";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start main-style">
      <h3>Últimos Anuncios</h3>
      <PostsGrid posts={[...mockedPosts, ...mockedPosts, ...mockedPosts]} recommendation={false} />
    </main>
  );
}
