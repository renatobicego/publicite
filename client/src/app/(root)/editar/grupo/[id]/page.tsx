import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import { getGroupById } from "@/services/groupsService";
import { Group } from "@/types/userTypes";
import { EDIT_GROUP, EDIT_POST, GROUPS, POSTS } from "@/utils/data/urls";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EditGroup from "./EditGroup";
export default async function EditGroupPage({
  params,
}: {
  params: { id: string };
}) {
  const groupData: Group | { error: string } = await getGroupById(params.id);
  if (
    !("error" in groupData) &&
    !(groupData.admins as string[]).includes(
      auth().sessionClaims?.metadata.mongoId as string
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
