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
    <main className="flex min-h-screen flex-col items-start main-style gap-8">
      <BreadcrumbsAdmin
        items={[
          { label: "Inicio", href: "/" },
          { label: "Suscripciones", href: SUBSCRIPTIONS },
          { label: "Hacete Amigo", href: FRIEND_PLAN_INFO },
        ]}
      />
      <section className="w-full max-w-3xl mx-auto flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl font-semibold">Hacete Amigo</h1>
        <FriendPlanLanding
          options={options}
          hasGroup={!("error" in mine) && !!mine.group}
          invitationsCount={"error" in mine ? 0 : mine.invitations.length}
        />
      </section>
    </main>
  );
}
