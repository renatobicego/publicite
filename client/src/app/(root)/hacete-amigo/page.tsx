import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { FRIEND_PLAN, FRIEND_PLAN_INFO, SUBSCRIPTIONS } from "@/utils/data/urls";
import FriendGroupPanel from "./FriendGroupPanel";

export const metadata = {
  title: "Mi grupo de Hacete Amigo - Publicité",
  description: "Tu grupo de Hacete Amigo: miembros, invitaciones y pago.",
};

export default function FriendGroupPage() {
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-8">
      <BreadcrumbsAdmin
        items={[
          { label: "Inicio", href: "/" },
          { label: "Suscripciones", href: SUBSCRIPTIONS },
          { label: "Hacete Amigo", href: FRIEND_PLAN_INFO },
          { label: "Mi grupo", href: FRIEND_PLAN },
        ]}
      />
      <section className="w-full max-w-3xl mx-auto flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl font-semibold">
          Mi grupo de Hacete <span className="text-service">Amigo</span>
        </h1>
        <FriendGroupPanel />
      </section>
    </main>
  );
}
