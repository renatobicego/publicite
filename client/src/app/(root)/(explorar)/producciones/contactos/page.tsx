import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import SolapasTabs from "@/components/solapas/SolapasTabs";
import { PRODUCTIONS, PRODUCTIONS_CONTACTS } from "@/utils/data/urls";

export const metadata = {
  title: "Producciones de mi agenda - Publicité",
  description: "Explora los blogs de agenda de tus contactos en Publicité.",
};

export default async function ContactProductionsPage() {
  const breadcrumbsItems = [
    { label: "Inicio", href: "/" },
    { label: "Producciones", href: PRODUCTIONS },
    { label: "Producciones de mi agenda", href: PRODUCTIONS_CONTACTS },
  ];
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <SolapasTabs />
    </main>
  );
}
