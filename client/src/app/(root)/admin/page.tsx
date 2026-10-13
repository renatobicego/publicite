import { redirect } from "next/navigation";
import { ADMIN_INVOICES } from "@/utils/data/urls";

// /admin no tiene contenido propio: cada sección vive en su subruta.
export default function AdminPage() {
  redirect(ADMIN_INVOICES);
}
