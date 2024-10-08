// app/providers.tsx
"use client";

import { NextUIProvider } from "@nextui-org/react";
import { AppProgressBar as ProgressBar, useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";
export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? (
    <NextUIProvider navigate={router.push}>
      {children}
      <ProgressBar
        height="4px"
        color="#F0931A"
        options={{ showSpinner: true }}
        shallowRouting
      />
    </NextUIProvider>
  ) : (
    <></>
  );
}
