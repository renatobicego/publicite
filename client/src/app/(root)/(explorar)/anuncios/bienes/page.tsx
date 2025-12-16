import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import {
  goodsBreadcrumbsItems,
  postsBaseBreadcrumbsItems,
} from "../breadrcrumbsItems";

export default async function PostsGoodsList() {
  const breadcrumbsItems = [
    ...postsBaseBreadcrumbsItems,
    goodsBreadcrumbsItems,
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
