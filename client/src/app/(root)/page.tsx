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
      <div className="text-xs lg:text-sm lg:max-w-[50%]">
        <p>¡Hola! Ayudas para entender el sitio</p>
        <ul className="list-disc list-inside">
          <li>Regístrate - Inicia sesión</li>
          <li>
            Crea Anuncios - Libres son públicos, de Agenda solo contactos de
            agenda
          </li>
          <li>Crea relaciones</li>
          <li>Activa cuentas para ver anuncios de tus contactos</li>
        </ul>
      </div>
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
