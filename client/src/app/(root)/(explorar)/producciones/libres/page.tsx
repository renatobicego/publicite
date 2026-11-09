import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import { PRODUCTIONS, PRODUCTIONS_LIBRE } from "@/utils/data/urls";

export const metadata = {
  title: "Producciones geolocalizadas - Publicité",
  description: "Explora los blogs geolocalizados cerca tuyo en Publicité.",
};

export default async function LibreProductionsPage() {
  const breadcrumbsItems = [
    { label: "Inicio", href: "/" },
    { label: "Producciones", href: PRODUCTIONS },
    { label: "Producciones geolocalizadas", href: PRODUCTIONS_LIBRE },
  ];
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
