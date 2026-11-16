import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import {
  getFriendPlanOptions,
  getMyFriendGroup,
} from "@/services/friendGroupServices";
import { FRIEND_PLAN_INFO, SUBSCRIPTIONS } from "@/utils/data/urls";
import FriendPlanLanding from "./FriendPlanLanding";

export const metadata = {
  title: "Hacete Amigo - Publicité",
  description: "Armá tu grupo y pagá menos: uno paga por todos con débito automático.",
};

export default async function FriendPlanPage() {
  const [options, mine] = await Promise.all([
    getFriendPlanOptions(),
    getMyFriendGroup(),
  ]);
  if ("error" in options) return <ErrorCard message={options.error} />;

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-3">
      <BreadcrumbsAdmin
        items={[
          { label: "Inicio", href: "/" },
          { label: "Suscripciones", href: SUBSCRIPTIONS },
          { label: "Hacete Amigo", href: FRIEND_PLAN_INFO },
        ]}
      />
      {/* Asistente de dos pasos: cada paso entra en la pantalla, sin scroll. */}
      <section className="w-full max-w-3xl mx-auto flex flex-col gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold">Hacete Amigo</h1>
        <FriendPlanLanding
          options={options}
          hasGroup={!("error" in mine) && !!mine.group}
          invitationsCount={"error" in mine ? 0 : mine.invitations.length}
        />
      </section>
    </main>
  );
}
