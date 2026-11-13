"use client";

import dynamic from "next/dynamic";

// El Brick de MercadoPago sólo corre en el navegador (`ssr: false` exige un Client Component).
const FriendGroupPayLoader = dynamic(() => import("./FriendGroupPay"), {
  ssr: false,
});

export default FriendGroupPayLoader;
