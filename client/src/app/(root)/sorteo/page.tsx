import { auth } from "@clerk/nextjs/server";
import { getGiveaway } from "@/services/sorteoService";
import { CURRENT_GIVEAWAY_ID } from "@/utils/data/sorteoConfig";
import ErrorCard from "@/components/ErrorCard";
import SorteoHero from "./SorteoHero";
import SorteoParticipate from "./SorteoParticipate";
import SorteoCountdown from "./SorteoCountdown";
import SorteoWinner from "./SorteoWinner";

// Datos hardcodeados del sorteo actual (no vienen del BE)
const SORTEO_CONFIG = {
    title: "ANTEOJOS OFICIALES",
    subtitle: "de la Selección Argentina ⭐⭐⭐",
    badge: "COLECCIÓN MUNDIAL 2026",
    image: "/sorteo-lentes.png", // poner la imagen en /public
    endDate: "2026-07-02T18:30:00", // Martes 2 de Julio 2026, 18:30hs
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
