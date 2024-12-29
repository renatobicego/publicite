import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import {
  bestRatedPostBreadcrumbsItems,
  serviceBreadcrumbsItems,
} from "../../breadrcrumbsItems";

export default async function PostsContactServiceList() {
  const breadcrumbsItems = [
    ...bestRatedPostBreadcrumbsItems,
    serviceBreadcrumbsItems,
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
