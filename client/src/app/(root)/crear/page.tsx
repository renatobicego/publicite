import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import {
  CREATE,
  CREATE_GROUP,
  CREATE_MAGAZINE,
  CREATE_PETITION,
  CREATE_POST,
} from "@/utils/data/urls";
import { FaCamera, FaUserGroup } from "react-icons/fa6";
import { IoBook } from "react-icons/io5";
import { MdQuestionAnswer } from "react-icons/md";
import CreateCard, { PostType } from "./CreateCard";

//add metadata
export const metadata = {
  title: "Crear - Publicité",
  description: "Crea publicaciones, grupos y revistas en Publicité.",
};

export default function Create() {
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Crear",
      href: CREATE,
    },
  ];
  const postsTypes: PostType[] = [
    {
      label: "Publicar Anuncio",
      description: "Crea un anuncio para la venta de un bien o servicio.",
      icon: FaCamera,
      bg: "bg-primary",
      url: CREATE_POST,
    },
    {
      label: "Publicar Necesidad",
      description: "Crea una necesidad para solicitar un bien o servicio.",
      icon: MdQuestionAnswer,
      url: CREATE_PETITION,
      bg: "bg-petition",
    },
    {
      label: "Crear Revista",
      description: "Crea una revista para guardar y organizar anuncios.",
      icon: IoBook,
      url: CREATE_MAGAZINE,
      bg: "bg-secondary",
    },
    {
      label: "Crear Grupo",
      description:
        "Crea un grupo con contactos para mostrar anuncios y crear revistas compartidas.",
      icon: FaUserGroup,
      url: CREATE_GROUP,
      bg: "bg-service",
    },
  ];
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-6 md:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold">
        ¿Qué tipo de publicación te gustaría crear?
      </h1>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-5">
        {postsTypes.map((postType) => (
          <CreateCard key={postType.label} postType={postType} />
        ))}
      </section>
    </main>
  );
}
