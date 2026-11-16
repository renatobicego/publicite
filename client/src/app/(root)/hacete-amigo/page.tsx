import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { FRIEND_PLAN, FRIEND_PLAN_INFO, SUBSCRIPTIONS } from "@/utils/data/urls";
import FriendGroupPanel from "./FriendGroupPanel";

export const metadata = {
  title: "Mi grupo de Hacete Amigo - Publicité",
  description: "Tu grupo de Hacete Amigo: miembros, invitaciones y pago.",
};

export default async function FriendGroupPage(props: {
  searchParams: Promise<{ paso?: string }>;
}) {
  const { paso } = await props.searchParams;
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-3">
      <BreadcrumbsAdmin
        items={[
          { label: "Inicio", href: "/" },
          { label: "Suscripciones", href: SUBSCRIPTIONS },
          { label: "Hacete Amigo", href: FRIEND_PLAN_INFO },
          { label: "Mi grupo", href: FRIEND_PLAN },
        ]}
      />
      {/* Mientras se arma, el grupo es un asistente de 4 pasos que entra sin scroll. */}
      <section className="w-full max-w-3xl mx-auto flex flex-col gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Mi grupo de Hacete <span className="text-service">Amigo</span>
        </h1>
        <FriendGroupPanel initialStep={Number(paso) || 1} />
      </section>
    </main>
  );
}
