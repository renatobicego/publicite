import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import { bestRatedPostBreadcrumbsItems } from "../breadrcrumbsItems";

export default async function ContactPostsList() {

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={bestRatedPostBreadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
