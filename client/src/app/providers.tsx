// app/providers.tsx
'use client'

import {NextUIProvider} from '@nextui-org/react'
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (isMounted) {
    return <NextUIProvider>{children}</NextUIProvider>;
  }else {
    return <>{children}</> 
  }
}
