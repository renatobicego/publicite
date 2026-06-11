import UserAmountChips from "@/components/chips/UserAmountChips";
import HomePostSection from "@/components/grids/HomePostSection";
import SelectManualLocationModal from "@/components/modals/SelectManualLocation/SelectManualLocationModal";
import { POSTS } from "@/utils/data/urls";
import { Spinner } from "@nextui-org/react";
import { Suspense } from "react";
import NovedadesCarousel from "./novedades/NovedadesCarousel";
import { getAllNovelties, parseNoveltyBlocks } from "@/services/noveltyService";
import { Novedad } from "@/types/novedades";
import SorteoHomeBanner from "./sorteo/SorteoHomeBanner";
import { getGiveaway } from "@/services/sorteoService";
import { CURRENT_GIVEAWAY_ID } from "@/utils/data/sorteoConfig";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const loggedUser = auth();
  const userId = loggedUser.userId;

  // Fetch novelties from backend
  const noveltiesData = await getAllNovelties();

  // Transform backend data to frontend format
  const novedades = !("error" in noveltiesData) && await Promise.all(noveltiesData.map(async (novelty) => ({
    id: novelty._id,
    slug: novelty._id,
    createdAt: novelty.createdAt,
    updatedAt: novelty.updatedAt,
    content: await parseNoveltyBlocks(novelty.blocks),
  })));

  // Fetch giveaway data
  const giveawayData = await getGiveaway(CURRENT_GIVEAWAY_ID);
  const isParticipating =
    userId && !("error" in giveawayData)
      ? giveawayData.participants.includes(userId)
      : false;

  return (
    <main
      id="home-grids"
      className="flex min-h-screen flex-col items-start main-style gap-8"
    >
      {novedades && <NovedadesCarousel novedades={novedades as Novedad[]} />}

      {/* Banner del sorteo */}
      {!("error" in giveawayData) && (
        <SorteoHomeBanner
          isLoggedIn={!!userId}
          isParticipating={isParticipating}
          userId={userId}
          giveawayId={CURRENT_GIVEAWAY_ID}
        />
      )}

      <div className="text-xs lg:text-sm lg:max-w-[50%]">
        {/* <p>¡Hola!</p>
        <ul className="list-disc list-inside">
          <li>Regístrate - Inicia sesión</li>
          <li>
            Crea Anuncios - Libres son públicos, de Agenda solo contactos de
            agenda
          </li>
          <li>Crea relaciones</li>
          <li>Activa cuentas para ver anuncios de tus contactos</li>
        </ul> */}
        {/* <Image
          src="/instructivo.png"
          alt="instructivo"
          className="object-contain"
          width={600}
          removeWrapper
        /> */}
        <UserAmountChips />
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
