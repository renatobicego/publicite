import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import { getMagazineById } from "@/services/magazineService";
import { EDIT_MAGAZINE, GROUPS, MAGAZINES, PROFILE } from "@/utils/data/urls";
import { currentUser } from "@clerk/nextjs/server";
import { GetUser } from "@/types/userTypes";
import {
  getOwner,
  getProfileUrl,
} from "@/app/(root)/(explorar)/revistas/[id]/utils";
import { Magazine } from "@/types/magazineTypes";
import { Group } from "@/types/groupTypes";
import EditMagazineForm from "./EditMagazineForm";
export default async function EditMagazinePage({
  params,
}: {
  params: { id: string };
}) {
  const magazineData: Magazine | { error: string } = await getMagazineById(
    params.id
  );
  const userLogged = await currentUser();
  //   if (
  //     !("error" in magazineData) &&
  //     userLogged?.username !== magazineData.author.username
  //   ) {
  //     redirect(`${POSTS}/${params.id}`);
  //   }
  if ("error" in magazineData) {
    return <ErrorCard message={magazineData.error} />;
  }
  const owner = getOwner(magazineData);
  const isOwnerTypeUser = magazineData.ownerType === "user";
  const urlProfile = getProfileUrl(owner, isOwnerTypeUser);
  const ownerAsUser = owner as GetUser;
  const ownerAsGroup = owner as Group;
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: isOwnerTypeUser ? "Perfiles" : "Grupos",
      href: isOwnerTypeUser ? PROFILE : GROUPS,
    },
    {
      label: isOwnerTypeUser ? ownerAsUser.username : ownerAsGroup.name,
      href: urlProfile,
    },
    {
      label: magazineData.name,
      href: `${MAGAZINES}/${magazineData._id}`,
    },
    {
      label: "Editar",
      href: `${EDIT_MAGAZINE}/${magazineData._id}`,
    },
  ];
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <h2>
        Editar Revista{" "}
        <span className={`${isOwnerTypeUser && "hidden"}`}>de Grupo</span>
      </h2>
      <EditMagazineForm
        isGroupMagazine={magazineData.ownerType === "group"}
        magazineData={magazineData}
      />
    </main>
  );
}
