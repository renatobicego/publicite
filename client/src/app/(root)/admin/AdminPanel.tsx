"use client";

import { Tab, Tabs } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { FaFileInvoiceDollar, FaTicket, FaFlag } from "react-icons/fa6";
import {
  ADMIN_INVOICES,
  ADMIN_PRODUCTION_REPORTS,
  ADMIN_PRODUCTION_TICKETS,
} from "@/utils/data/urls";

const sections = [
  {
    href: ADMIN_INVOICES,
    label: "Tickets y Facturas",
    icon: <FaFileInvoiceDollar size={16} />,
  },
  {
    href: ADMIN_PRODUCTION_TICKETS,
    label: "Tickets de Producciones",
    icon: <FaTicket size={16} />,
  },
  {
    href: ADMIN_PRODUCTION_REPORTS,
    label: "Denuncias de Producciones",
    icon: <FaFlag size={16} />,
  },
];

/**
 * Marco del panel admin: título + navegación por tabs. Cada tab es una subruta
 * (`/admin/facturas`, `/admin/tickets-producciones`, …), así que una sección
 * nueva entra como una carpeta con su `page.tsx` y una entrada en `sections`.
 */
export default function AdminPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const selected =
    sections.find((section) => pathname.startsWith(section.href))?.href ??
    ADMIN_INVOICES;

  return (
    <main className="flex min-h-screen flex-col main-style px-4">
      <div className="w-full max-w-[100rem] mx-auto py-4">
        <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold mb-4">
          Panel de Administración
        </h1>
        <Tabs
          aria-label="Secciones del panel admin"
          color="primary"
          variant="underlined"
          selectedKey={selected}
          classNames={{
            tabList:
              "gap-6 w-full relative rounded-none p-0 border-b border-divider overflow-x-auto",
            cursor: "w-full bg-secondary",
            tab: "max-w-fit px-4 h-12",
            tabContent: "group-data-[selected=true]:text-secondary",
          }}
        >
          {sections.map((section) => (
            <Tab
              key={section.href}
              href={section.href}
              title={
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span>{section.label}</span>
                </div>
              }
            />
          ))}
        </Tabs>
        <div className="pt-4">{children}</div>
      </div>
    </main>
  );
}
