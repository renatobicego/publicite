"use client";

import Link from "next/link";
import { PRODUCTIONS } from "@/utils/data/urls";
import SecondaryButton from "@/components/buttons/SecondaryButton";

// Client Component: `as={Link}` no puede cruzar desde un Server Component
const ViewMoreProductionsButton = () => (
  <SecondaryButton as={Link} href={PRODUCTIONS} className="self-center mt-4">
    Ver Más Producciones
  </SecondaryButton>
);

export default ViewMoreProductionsButton;
