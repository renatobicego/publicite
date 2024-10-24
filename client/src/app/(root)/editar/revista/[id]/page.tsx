import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import {
  getMagazineById,
  getMagazineWithoutPostsById,
} from "@/services/magazineService";
import { EDIT_MAGAZINE, GROUPS, MAGAZINES, PROFILE } from "@/utils/data/urls";
import { auth, currentUser } from "@clerk/nextjs/server";
import { GetUser } from "@/types/userTypes";
import { getOwner, getProfileUrl } from "@/app/(root)/revistas/[id]/utils";
import { GroupMagazine, Magazine, UserMagazine } from "@/types/magazineTypes";
import { Group } from "@/types/groupTypes";
import EditMagazineForm from "./EditMagazineForm";
import { redirect } from "next/navigation";
export default async function EditMagazinePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const magazineData: Magazine | { error: string } =
    await getMagazineWithoutPostsById(params.id);
  const userLoggedId = auth().sessionClaims?.metadata.mongoId;
  if ("error" in magazineData) {
    return <ErrorCard message={magazineData.error} />;
  }
  const owner = getOwner(magazineData);
  const isOwnerTypeUser = magazineData.ownerType === "user";
  const urlProfile = getProfileUrl(owner, isOwnerTypeUser);
  const ownerAsUser = owner as GetUser;
  const ownerAsGroup = owner as Group;

  //Check if the user is allowed to edit the magazine
  if (
    isOwnerTypeUser &&
    (magazineData as UserMagazine).user._id !== userLoggedId &&
    !(magazineData as UserMagazine).collaborators.some(
      (collaborator: any) => collaborator._id === userLoggedId
    )
  ) {
    redirect(`${MAGAZINES}/${magazineData._id}`);
  } else if (
    !isOwnerTypeUser &&
    !(magazineData as GroupMagazine).allowedCollaborators.some(
      (collaborator: any) => collaborator._id === userLoggedId
    )
  ) {
    redirect(`${MAGAZINES}/${magazineData._id}`);
  }
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
