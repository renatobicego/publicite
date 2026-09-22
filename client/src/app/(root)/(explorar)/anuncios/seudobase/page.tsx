import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PostsSeudoBaseTable from "./components/PostsSeudoBaseTable";

/**
 * SeudoBase de Anuncios: gestión masiva tipo Excel de los anuncios del usuario
 * logueado (precio, visibilidad, borrado). Requiere sesión.
 */
export default function PostsSeudoBasePage() {
  const user = auth();
  if (!user.userId) {
    redirect("/iniciar-sesion");
  }

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <h2>SeudoBase · Mis anuncios</h2>
      <p className="text-sm text-default-500">
        Gestión masiva de tus anuncios como una tabla de Excel: cambiá el
        precio, la visibilidad o borralos en lote.
      </p>
      <PostsSeudoBaseTable />
    </main>
  );
}
