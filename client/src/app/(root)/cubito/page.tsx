import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CubitoTabs from "./CubitoTabs";

export const metadata = {
    title: "Cubito - Asistente de Publicite",
    description: "Chateá con Cubito, el asistente inteligente de Publicite",
};

export default async function CubitoPage(props: { searchParams: Promise<{ tab?: string }> }) {
    const searchParams = await props.searchParams;
    const user = await auth();
    if (!user) {
        redirect("/iniciar-sesion");
    }

    return (
        <main className="flex min-h-screen flex-col items-center main-style px-4">
            <CubitoTabs defaultTab={searchParams.tab} />
        </main>
    );
}
