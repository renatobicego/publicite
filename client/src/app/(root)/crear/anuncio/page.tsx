import BreadcrumbsAdmin from "@/app/components/BreadcrumbsAdmin";
import { CREATE, CREATE_POST } from "@/app/utils/urls";
import UploadImages from "./components/Upload/UploadImages";

export default function CreatePost() {
    const breadcrumbsItems = [
      {
        label: "Inicio",
        href: "/",
      },
      {
        label: "Crear",
        href: CREATE,
      },
      {
        label: "Anuncio",
        href: CREATE_POST,
      },
    ]
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <section className="w-full">
        <UploadImages />
      </section>
    </main>
  );
}
