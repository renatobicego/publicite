import HomePostSection from "@/components/grids/HomePostSection";
import SelectManualLocationModal from "@/components/modals/SelectManualLocation/SelectManualLocationModal";
import { POSTS } from "@/utils/data/urls";
import { Spinner } from "@nextui-org/react";
import { Suspense } from "react";
export default function Home() {
  return (
    <main
      id="home-grids"
      className="flex min-h-screen flex-col items-start main-style gap-8"
    >
      <SelectManualLocationModal />
      <Suspense fallback={<Spinner color="warning" />}>
        <HomePostSection
          type={"goodService"}
          title="Últimos Anuncios"
          buttonText="Ver Más Anuncios"
          buttonHref={POSTS}
        />
      </Suspense>

      <Suspense fallback={<Spinner color="warning" />}>
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
