"use client";

import { Spinner } from "@nextui-org/react";
import dynamic from "next/dynamic";

// El Brick de MercadoPago sólo corre en el navegador (`ssr: false` exige un Client Component).
const GiftPlanFormLoader = dynamic(() => import("./GiftPlanForm"), {
  ssr: false,
  loading: () => (
    <div className="flex w-full justify-center py-16">
      <Spinner />
    </div>
  ),
});

export default GiftPlanFormLoader;
