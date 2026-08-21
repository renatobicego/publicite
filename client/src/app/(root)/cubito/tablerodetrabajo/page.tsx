import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CubitoTabs from "../CubitoTabs";

export const metadata = {
    title: "Tablero de Trabajo - Cubito",
    description: "Tablero de Trabajo de Cubito con Valuación IA y Match IA",
};

export default function TableroDeTrabajoPage() {
    const user = auth();
    if (!user) {
        redirect("/iniciar-sesion");
    }

    return (
        <main className="flex min-h-screen flex-col items-center main-style px-4">
            <CubitoTabs defaultTab="tablero" />
        </main>
    );
}
