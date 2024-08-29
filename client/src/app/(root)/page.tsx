
import PostsGrid from "../components/grids/PostGrid";
import { mockedPosts } from "../utils/mockedData";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start main-style">
      <h3>Últimos Anuncios</h3>
      <PostsGrid posts={[...mockedPosts, ...mockedPosts, ...mockedPosts]} recommendation={false} />
    </main>
  );
}
