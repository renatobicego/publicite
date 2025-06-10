import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import {
  bestRatedPostBreadcrumbsItems,
  petitionBreadcrumbsItems,
} from "../../breadrcrumbsItems";
export default async function PostsContactPetitionsList() {
  const breadcrumbsItems = [
    ...bestRatedPostBreadcrumbsItems,
    petitionBreadcrumbsItems,
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
