import { notFound } from "next/navigation";
import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import { adSpacesBreadcrumbsItems } from "../../breadrcrumbsItems";
import {
  adSpaceMediumBySlug,
  adSpaceMediumUrl,
} from "@/utils/data/adSpaces";

export default async function AdSpacesByMediumPage(props: {
  params: Promise<{ medio: string }>;
}) {
  const { medio } = await props.params;
  const medium = adSpaceMediumBySlug(medio);
  if (!medium) notFound();
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin
        items={[
          ...adSpacesBreadcrumbsItems,
          { label: medium.label, href: adSpaceMediumUrl(medium) },
        ]}
      />
      <SolapasTabs />
    </main>
  );
}
