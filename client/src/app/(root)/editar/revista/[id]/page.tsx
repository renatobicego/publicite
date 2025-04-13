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
  // get magazine data
  const magazineData: Magazine | { error: string } =
    await getMagazineWithoutPostsById(params.id);
  const userLoggedId = auth().sessionClaims?.metadata.mongoId;
  // if there is an error, return error card
  if ("error" in magazineData) {
    return <ErrorCard message={magazineData.error} />;
  }
  // get data of the owner (group or user)
  const owner = getOwner(magazineData);
  // check if the user is the owner
  const isOwnerTypeUser = magazineData.ownerType === "user";
  // get url of the profile to add to the breadcrumbs
  const urlProfile = getProfileUrl(owner, isOwnerTypeUser);
  // cast the owner to user or group
  const ownerAsUser = owner as GetUser;
  const ownerAsGroup = owner as Group;

  //Check if the user is allowed to edit the magazine
  // if the owner is a user, only the owner cand edit (not collaborators)
  // if the owner is a group, only the admin or creator can edit (not allow collaborators)
  const isUserOwner = isOwnerTypeUser && ownerAsUser._id === userLoggedId; // user is the creator of the mag
  const isGroupAdmin =
    !isOwnerTypeUser &&
    ownerAsGroup.admins.some(
      (collaborator: any) => collaborator === userLoggedId
    ); // user is admin of the group
  const isGroupCreator =
    !isOwnerTypeUser && (ownerAsGroup.creator as any) === userLoggedId; // user is creator of the group

  if (isOwnerTypeUser) {
    // if the owner is a user
    if (!isUserOwner) {
      // if the user is not the owner redirect back
      redirect(`${MAGAZINES}/${magazineData._id}`);
    }
  } else {
    if (!isGroupAdmin && !isGroupCreator) {
      // if the user is not admin or creator redirect back
      redirect(`${MAGAZINES}/${magazineData._id}`);
    }
  }
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: isOwnerTypeUser ? "Carteles de Usuario" : "Grupos",
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
