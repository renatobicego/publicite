"use client";

import dynamic from "next/dynamic";

// `ssr: false` sólo se puede usar desde un Client Component.
const CheckoutLoader = dynamic(() => import("./Checkout"), {
  ssr: false,
});

export default CheckoutLoader;
