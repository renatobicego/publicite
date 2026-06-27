import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getGiveaway } from "@/services/sorteoService";
import { CURRENT_GIVEAWAY_ID } from "@/utils/data/sorteoConfig";
import ErrorCard from "@/components/ErrorCard";
import SorteoHero from "./SorteoHero";
import SorteoParticipate from "./SorteoParticipate";
import SorteoCountdown from "./SorteoCountdown";
import SorteoWinner from "./SorteoWinner";
import ShareButton from "./ShareButton";

// Datos hardcodeados del sorteo actual (no vienen del BE)
const SORTEO_CONFIG = {
    title: "ANTEOJOS OFICIALES",
    subtitle: "de la Selección Argentina ⭐⭐⭐",
    badge: "COLECCIÓN MUNDIAL 2026",
    image: "/sorteo-lentes.png", // poner la imagen en /public
    endDate: "2026-06-27T22:00:00", // Viernes 27 de Junio 2026, 22:00hs
};

export const metadata: Metadata = {
    title: "Sorteo Anteojos Oficiales Selección Argentina - Publicité",
    description:
        "Participá del sorteo de anteojos oficiales de la Selección Argentina ⭐⭐⭐ Colección Mundial 2026. Sorteo en vivo el 27 de Junio a las 22hs.",
    openGraph: {
        title: "Sorteo Anteojos Oficiales Selección Argentina - Publicité",
        description:
            "Participá del sorteo de anteojos oficiales de la Selección Argentina ⭐⭐⭐ Colección Mundial 2026. Sorteo en vivo el 27 de Junio a las 22hs.",
        images: [
            {
                url: "https://soonpublicite.com/sorteo-lentes.png",
                width: 1200,
                height: 630,
                alt: "Sorteo Anteojos Oficiales Selección Argentina",
            },
        ],
        type: "website",
        locale: "es_AR",
        siteName: "Publicité",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sorteo Anteojos Oficiales Selección Argentina - Publicité",
        description:
            "Participá del sorteo de anteojos oficiales de la Selección Argentina ⭐⭐⭐ Colección Mundial 2026. Sorteo en vivo el 27 de Junio a las 22hs.",
        images: ["https://soonpublicite.com/sorteo-lentes.png"],
    },
};

export default async function SorteoPage() {
    const loggedUser = auth();
    const userId = loggedUser.userId;

    const giveawayData = await getGiveaway(CURRENT_GIVEAWAY_ID);

    if (giveawayData && "error" in giveawayData) {
        return <ErrorCard message={giveawayData.error} />;
    }

    const isParticipating = userId
        ? giveawayData.participants.includes(userId)
        : false;

    const hasWinner = !!giveawayData.winner;

    return (
        <main className="flex min-h-screen flex-col items-center main-style gap-10 pb-16">
            {/* Hero - Imagen del producto */}
            <SorteoHero
                title={SORTEO_CONFIG.title}
                subtitle={SORTEO_CONFIG.subtitle}
                badge={SORTEO_CONFIG.badge}
                image={SORTEO_CONFIG.image}
            />

            {/* Cómo participar + botón */}
            <SorteoParticipate
                isLoggedIn={!!userId}
                isParticipating={isParticipating}
                userId={userId}
                giveawayId={CURRENT_GIVEAWAY_ID}
                participantsCount={giveawayData.participants.length}
            />

            {/* Countdown / Fecha del sorteo */}
            <SorteoCountdown endDate={SORTEO_CONFIG.endDate} hasWinner={hasWinner} />

            {/* Compartir */}
            <ShareButton />

            {/* Ganador (si ya hay) */}
            {hasWinner && giveawayData.winner && (
                <SorteoWinner winner={giveawayData.winner} />
            )}

            {/* Footer message */}
            <p className="text-sm text-muted-foreground text-center">
                ♥ Próximamente más sorteos exclusivos para nuestra comunidad.
            </p>
        </main>
    );
}
