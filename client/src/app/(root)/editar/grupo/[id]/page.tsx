import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import { getGroupById } from "@/services/groupsService";
import { User } from "@/types/userTypes";
import { Group } from "@/types/groupTypes";
import { EDIT_GROUP, EDIT_POST, GROUPS, POSTS } from "@/utils/data/urls";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EditGroup from "./EditGroup";
export default async function EditGroupPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const groupData: Group | { error: string } = await getGroupById(params.id);
  const loggedUser = await currentUser();

  if (
    !("error" in groupData) &&
    !groupData.admins.some(
      (admin) =>
        (admin as User)._id === (loggedUser?.publicMetadata.mongoId as string)
    )
  ) {
    redirect(`${GROUPS}/${params.id}`);
  }
  if ("error" in groupData) {
    return <ErrorCard message={groupData.error} />;
  }
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Grupos",
      href: GROUPS,
    },
    {
      label: groupData.name,
      href: `${GROUPS}/${params.id}`,
    },
    {
      label: "Editar",
      href: `${EDIT_GROUP}/${params.id}`,
    },
  ];
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <EditGroup groupData={groupData} />
    </main>
  );
}
