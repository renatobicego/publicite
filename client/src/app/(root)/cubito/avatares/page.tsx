import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CubitoTabs from "../CubitoTabs";

export const metadata = {
    title: "Avatares - Cubito",
    description: "Creá y gestioná tus avatares de IA para personalizar a Cubito",
};

export default async function AvataresPage() {
    const user = await auth();
    if (!user) {
        redirect("/iniciar-sesion");
    }

    return (
        <main className="flex min-h-screen flex-col items-center main-style px-4">
            <CubitoTabs defaultTab="avatares" />
        </main>
    );
}
