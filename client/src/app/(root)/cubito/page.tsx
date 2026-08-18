import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CubitoTabs from "./CubitoTabs";

export const metadata = {
    title: "Cubito - Asistente de Publicite",
    description: "Chateá con Cubito, el asistente inteligente de Publicite",
};

export default function CubitoPage({ searchParams }: { searchParams: { tab?: string } }) {
    const user = auth();
    if (!user) {
        redirect("/iniciar-sesion");
    }

    return (
        <main className="flex min-h-screen flex-col items-center main-style px-4">
            <CubitoTabs defaultTab={searchParams.tab} />
        </main>
    );
}
