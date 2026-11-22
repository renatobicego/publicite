import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import { adSpacesBreadcrumbsItems } from "../breadrcrumbsItems";

export default async function AdSpacesPage() {
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={adSpacesBreadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
