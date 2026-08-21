"use client";

import { Tab, Tabs } from "@nextui-org/react";
import { FaFileInvoiceDollar } from "react-icons/fa6";

import AdminInvoicesTable from "./invoices/AdminInvoicesTable";

/**
 * Layout del panel admin. Está armado con tabs aunque hoy haya una sola
 * sección: las próximas funciones de admin (usuarios, reportes) entran como un
 * `<Tab>` más sin tocar la página.
 */
export default function AdminPanel() {
  return (
    <div className="w-full max-w-[100rem] mx-auto py-4">
      <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold mb-4">
        Panel de Administración
      </h1>
      <Tabs
        aria-label="Secciones del panel admin"
        color="primary"
        variant="underlined"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-secondary",
          tab: "max-w-fit px-4 h-12",
          tabContent: "group-data-[selected=true]:text-secondary",
        }}
      >
        <Tab
          key="tickets"
          title={
            <div className="flex items-center gap-2">
              <FaFileInvoiceDollar size={16} />
              <span>Tickets y Facturas</span>
            </div>
          }
        >
          <div className="pt-4">
            <AdminInvoicesTable />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
