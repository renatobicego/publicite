import {
  ADMIN_INVOICES,
  ADMIN_MP_TEST,
  ADMIN_PLAN_GIFTS,
  ADMIN_PRODUCTION_REPORTS,
  ADMIN_PRODUCTION_TICKETS,
  NOVELTIES,
} from "@/utils/data/urls";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { FaChevronDown } from "react-icons/fa6";

// Menú de administración del header. Sólo se renderiza para usuarios con rol
// admin; las rutas igual validan el rol por su cuenta (proxy.ts y backend).
const AdminDropdown = () => {
  return (
    <Dropdown radius="lg" placement="bottom-start" className="bg-fondo">
      <DropdownTrigger>
        <Button
          radius="full"
          variant="light"
          size="sm"
          className="text-text-color font-medium text-sm"
          endContent={<FaChevronDown className="size-3" />}
        >
          Admin
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Administración" className="bg-fondo">
        <DropdownItem
          href={ADMIN_INVOICES}
          className="rounded-full pl-4 text-text-color"
          key="facturacion"
          color="secondary"
          textValue="Facturación"
        >
          Facturación
        </DropdownItem>
        <DropdownItem
          href={ADMIN_PRODUCTION_TICKETS}
          className="rounded-full pl-4 text-text-color"
          key="tickets-producciones"
          color="secondary"
          textValue="Tickets de Producciones"
        >
          Tickets de Producciones
        </DropdownItem>
        <DropdownItem
          href={ADMIN_PRODUCTION_REPORTS}
          className="rounded-full pl-4 text-text-color"
          key="denuncias-producciones"
          color="secondary"
          textValue="Denuncias de Producciones"
        >
          Denuncias de Producciones
        </DropdownItem>
        <DropdownItem
          href={ADMIN_PLAN_GIFTS}
          className="rounded-full pl-4 text-text-color"
          key="regalos"
          color="secondary"
          textValue="Regalos de planes"
        >
          Regalos de planes
        </DropdownItem>
        <DropdownItem
          href={ADMIN_MP_TEST}
          className="rounded-full pl-4 text-text-color"
          key="prueba-mp"
          color="secondary"
          textValue="Prueba de MercadoPago"
        >
          Prueba de MercadoPago
        </DropdownItem>
        <DropdownItem
          href={NOVELTIES}
          className="rounded-full pl-4 text-text-color"
          key="novedades"
          color="secondary"
          textValue="Novedades"
        >
          Novedades
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default AdminDropdown;
