import AdminPanel from "./AdminPanel";

export const metadata = {
  title: "Panel Admin - Publicite",
  description: "Gestión de tickets y facturas",
};

export default function AdminPage() {
  return (
    <main className="flex min-h-screen flex-col main-style px-4">
      <AdminPanel />
    </main>
  );
}
