import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import { postsBaseBreadcrumbsItems } from "./breadrcrumbsItems";

export const metadata = {
  title: "Anuncios - Publicité",
  description: "Explora los anuncios publicados en Publicité.",
};

export default async function PostsList() {
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={postsBaseBreadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
