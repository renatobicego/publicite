import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import { getGroupById } from "@/services/groupsService";
import { User } from "@/types/userTypes";
import { Group } from "@/types/groupTypes";
import { EDIT_GROUP, GROUPS } from "@/utils/data/urls";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EditGroup from "./EditGroup";
export default async function EditGroupPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const groupData: { group: Group } | { error: string } = await getGroupById(
    params.id
  );
  const loggedUser = auth();
  const loggedUserId = loggedUser?.sessionClaims?.metadata.mongoId as string;


  if (
    !("error" in groupData) &&
    (!groupData.group.admins.some(
      (admin) => (admin as User)._id === loggedUserId
    ) &&
      groupData.group.creator._id !== loggedUserId)
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
      label: groupData.group.name,
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
      <EditGroup groupData={groupData.group} />
    </main>
  );
}
