// app/providers.tsx
"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ProgressProvider, useRouter } from "@bprogress/next/app";
import { useEffect, useState } from "react";

// useRouter de bprogress debe usarse dentro del ProgressProvider
function NextUIWithRouter({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return <NextUIProvider navigate={router.push}>{children}</NextUIProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? (
    <ProgressProvider
      height="4px"
      color="#F0931A"
      options={{ showSpinner: true }}
      shallowRouting
    >
      <NextUIWithRouter>{children}</NextUIWithRouter>
    </ProgressProvider>
  ) : (
    <></>
  );
}
