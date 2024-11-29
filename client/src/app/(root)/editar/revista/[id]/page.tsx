import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import { getMagazineWithoutPostsById } from "@/services/magazineService";
import { EDIT_MAGAZINE, GROUPS, MAGAZINES, PROFILE } from "@/utils/data/urls";
import { auth } from "@clerk/nextjs/server";
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
  const isUserOwner = isOwnerTypeUser && (magazineData as UserMagazine).user._id === userLoggedId;
  const isGroupAdmin = (
    (magazineData as GroupMagazine).group as Group
  ).admins.some((collaborator: any) => collaborator === userLoggedId);
  const isGroupCreator =
    ((magazineData as GroupMagazine).group as Group).creator === userLoggedId;

  if (isOwnerTypeUser) {
    if (!isUserOwner) {
      redirect(`${MAGAZINES}/${magazineData._id}`);
    }
  } else {
    if (!isGroupAdmin && !isGroupCreator) {
      redirect(`${MAGAZINES}/${magazineData._id}`);
    }
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
