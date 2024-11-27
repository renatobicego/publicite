import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { GROUPS } from "@/utils/data/urls";
import ErrorCard from "@/components/ErrorCard";
import { auth, currentUser } from "@clerk/nextjs/server";
import GroupInfo from "./(components)/GroupInfo";
import { getGroupById } from "@/services/groupsService";
import GroupSolapas from "@/components/solapas/GroupSolapas";
import { User } from "@/types/userTypes";
import { GroupAdmin } from "@/types/groupTypes";
import { redirect } from "next/navigation";
import JoinGroupCard from "./JoinGroupCard";

export default async function GroupLayout(props: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const params = await props.params;
  const { children } = props;
  const groupData:
    | {
        group: GroupAdmin;
        isMember: boolean;
        hasJoinRequest: boolean;
        hasGroupRequest: boolean;
      }
    | { error: string; error2: string } = await getGroupById(params.id);
  if ("error" in groupData) {
    return <ErrorCard message={groupData.error} error={groupData.error2} />;
  }
  const { group, isMember } = groupData;
  const loggedUser = await currentUser();
  if (!loggedUser) {
    redirect("/iniciar-sesion");
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
      label: group.name,
      href: `${GROUPS}/${params.id}`,
    },
  ];
  const isCreator = loggedUser.publicMetadata.mongoId === group.creator;
  const isAdmin =
    group.admins.some(
      (admin) =>
        (admin as User)._id === (loggedUser?.publicMetadata.mongoId as string)
    ) || isCreator;
  

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 xl:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <div className="items-start flex gap-4 justify-between w-full max-md:flex-wrap">
        <GroupInfo group={groupData} isAdmin={isAdmin} isCreator={isCreator} />
      </div>
      {isMember ? (
        <>
          <GroupSolapas group={group} isAdmin={isAdmin} />
          {children}
        </>
      ) : (
        <JoinGroupCard groupId={params.id} />
      )}
    </main>
  );
}
