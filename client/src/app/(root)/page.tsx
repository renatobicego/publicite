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
      <p className="text-xs lg:text-sm lg:max-w-[50%]">
        Hola! Estamos trabajando para llevar el sitio al próximo nivel. Queremos
        mejorar la experiencia de los usuarios! Vamos por uno internacional.
        Mientras tanto puedes disfrutar del plan gratuito-extendido. Comparte
        Publicité a tus amigos, y a quien quieras ! Acompáñanos a mejorar el
        sitio. <strong className="font-noto">Publicité</strong> es tu sitio
        publicitario.
      </p>
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
