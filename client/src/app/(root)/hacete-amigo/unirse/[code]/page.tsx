import { auth } from "@clerk/nextjs/server";

import ErrorCard from "@/components/ErrorCard";
import { getFriendGroupByInviteCode } from "@/services/friendGroupServices";
import JoinFriendGroup from "./JoinFriendGroup";

export const metadata = {
  title: "Te invitaron a Hacete Amigo - Publicité",
  description: "Sumate al grupo y paguen menos: uno paga por todos.",
};

// Pública: se abre sin cuenta (ver proxy.ts). El server sólo da datos mínimos.
export default async function JoinFriendGroupPage(props: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await props.params;
  const { userId } = await auth();
  const group = await getFriendGroupByInviteCode(code);
  if ("error" in group) return <ErrorCard message={group.error} />;

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center main-style">
      <JoinFriendGroup code={code} group={group} isSignedIn={!!userId} />
    </main>
  );
}
