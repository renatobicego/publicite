import { auth } from "@clerk/nextjs/server";

import ErrorCard from "@/components/ErrorCard";
import { getPlanGiftByCode } from "@/services/planGiftServices";
import RedeemGift from "./RedeemGift";

export const metadata = {
  title: "Te regalaron un plan - Publicité",
  description: "Canjeá el plan que te regalaron en Soon.",
};

// Pública: se abre sin cuenta (ver proxy.ts). El server sólo da datos mínimos.
export default async function RedeemGiftPage(props: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await props.params;
  const { userId } = await auth();
  const gift = await getPlanGiftByCode(code);
  if ("error" in gift) return <ErrorCard message={gift.error} />;

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center main-style">
      <RedeemGift gift={gift} isSignedIn={!!userId} />
    </main>
  );
}
