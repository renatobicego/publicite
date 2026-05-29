import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CubitoChat from "./CubitoChat";

export const metadata = {
    title: "Cubito - Asistente de Publicite",
    description: "Chateá con Cubito, el asistente inteligente de Publicite",
};

export default function CubitoPage() {
    const user = auth();
    if (!user) {
        redirect("/iniciar-sesion");
    }

    return (
        <main className="flex min-h-screen flex-col items-center main-style">
            <CubitoChat />
        </main>
    );
}
