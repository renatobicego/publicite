import HomePostSection from "@/components/grids/HomePostSection";
import { POSTS } from "@/utils/data/urls";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-8">
      <Suspense fallback={<div>Cargando anuncios...</div>}>
        <HomePostSection
          type={Math.random() > 0.5 ? "good" : "service"}
          title="Últimos Anuncios"
          buttonText="Ver Más Anuncios"
          buttonHref={POSTS}
        />
      </Suspense>

      <Suspense fallback={<div>Cargando necesidades...</div>}>
        <HomePostSection
          type="petition"
          title="¿Qué están buscando los usuarios?"
          buttonText="Ver Más Necesidades"
          buttonHref={`${POSTS}/necesidades`}
        />
      </Suspense>
    </main>
  );
}
