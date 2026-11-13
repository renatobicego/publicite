"use client";

import dynamic from "next/dynamic";

// El Brick de MercadoPago sólo corre en el navegador (`ssr: false` exige un Client Component).
const GiftPlanFormLoader = dynamic(() => import("./GiftPlanForm"), {
  ssr: false,
});

export default GiftPlanFormLoader;
